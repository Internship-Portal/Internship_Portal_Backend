import { Response, Request } from "express";
import { sendVerificationMail } from "../config/SES";
import verificationModel from "../models/Verification";
import userModel from "../models/User";

export const sendVerificationEmailController = async (
  req: Request,
  res: Response
) => {
  try {
    const { email_id }: { email_id: string } = req.body;

    // Check if email is already registered
    const emailExists = await userModel.findOne({ email: email_id });

    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // create OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    const emailFound = await verificationModel.findOne({ email_id: email_id });

    let verification;
    if (emailFound) {
      emailFound.otp = otp.toString();
      emailFound.otpverified = false;
      emailFound.expiresAt = new Date(Date.now() + 5 * 60 * 1000);
      verification = await emailFound.save();
    } else {
      // Save OTP
      verification = await verificationModel.create({
        email_id: email_id,
        otp: otp.toString(),
        otpverified: false,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });
    }

    if (verification) {
      // Send Email
      sendVerificationMail({
        templateName: "newverificationAccountTemplate",
        recipientEmail: email_id,
        otp: otp.toString(),
      })
        .then((e) => {
          return res.status(200).json({ message: "Email Sent" });
        })
        .catch((e) => {
          return res.status(500).json({ message: "Cannot send Email" });
        });
    } else {
      return res.status(500).json({ message: "Cannot create Request" });
    }
  } catch (error) {
    // Error
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const verifyEmailController = async (req: Request, res: Response) => {
  try {
    const { email_id, otp }: { email_id: string; otp: string } = req.body;

    const verification = await verificationModel.findOne({
      email_id: email_id,
    });

    if (verification) {
      if (verification.otp === otp) {
        verification.otpverified = true;
        await verification.save();
        return res.status(200).json({ message: "Email Verified" });
      } else {
        return res.status(400).json({ message: "OTP is not correct" });
      }
    } else {
      return res.status(400).json({ message: "Email is not registered" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
