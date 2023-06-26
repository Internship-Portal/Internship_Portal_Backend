import e, { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import CompanyModel from "../models/company";
import OfficerModel from "../models/officer";
import otpModel from "../models/otp";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";

// Forget Password OTP email send function.
function sendEmail(req: Request, OTP: number, name: string) {
  return new Promise((resolve, reject) => {
    // Configure the nodemailer
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "teamgenshinofficial@gmail.com",
        pass: "wkrivbrwloojnpzb",
      },
    });

    // Configure the mail
    const mail_configs = {
      from: "teamgenshinofficial@gmail.com",
      to: req.body.email_id,
      subject: "Internship Portal Password Recovery",
      html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>Internship Portal - OTP Email </title>
</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">OneCab</a>
    </div>
    <p style="font-size:1.1em">Hi ${name},</p>
    <p>Thank you for choosing Internship Portal. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Regards,<br />Internship Portal</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Internship Portal Inc</p>
      <p>Pimpri Chinchwad</p>
      <p>Pune</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
    };
    // Send the mail to the gmails.
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        // Error: error found
        return reject({ message: `An error has occured`, error: error });
      }
      // Success: Email Send
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}

export const sendOTP = async (req: Request, res: Response) => {
  // try {
  const { email_id }: { email_id: string } = req.body;
  // Check if the email_id is present in the database
  const foundCompany = await CompanyModel.findOne({ email_id: email_id });
  const foundOfficer = await OfficerModel.findOne({ email_id: email_id });

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000);
  if (foundCompany && !foundOfficer) {
    // Company found
    const company_id = foundCompany._id;
    // Create OTP Model
    const createdOTP = await otpModel.create({
      user_id: company_id,
      user: "company",
      otp: otp,
      otpverified: false,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });
    // Create JWT Token to send in the response
    const token = jwt.sign({ id: createdOTP._id }, SecretKey, {
      expiresIn: "5m",
    });

    // Send Email
    sendEmail(req, otp, foundCompany.username)
      .then((response) => {
        // Success
        res.status(200).json({ message: response, token: token });
      })
      .catch((error) => res.status(500).json({ error: error.message }));
  } else if (!foundCompany && foundOfficer) {
    // Officer found
    const officer_id = foundOfficer._id;

    // Create OTP Model
    const createdOTP = await otpModel.create({
      user_id: officer_id,
      user: "officer",
      otp: otp,
      otpverified: false,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Create JWT Token to send in the response
    const token = jwt.sign({ id: createdOTP._id }, SecretKey, {
      expiresIn: "5m",
    });

    // Send Email
    sendEmail(req, otp, foundOfficer.username)
      .then((response) => {
        // Success
        res.status(200).json({ message: response, token: token });
      })
      .catch((error) => res.status(500).json({ error: error.message }));
  } else {
    // Error: User not found
    return res.status(404).json({ message: "Invalid User" });
  }
  // } catch (e) {
  //   // Error:
  //   return res.status(500).json({ message: "Server Error" });
  // }
};

export const verifyOTP = async (req: Request, res: Response) => {
  try {
    const { otp }: { otp: number } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    // Check if the token and otp is present in the request
    if (!token || !otp) {
      // Error: Incomplete Data
      return res.status(401).json({ message: "Incomplete Data" });
    }

    // Verify the token
    const decoded = jwt.verify(token, SecretKey) as jwt.JwtPayload;

    // Find the OTP in the database
    const foundOTP = await otpModel.findById({ _id: decoded.id });

    if (!foundOTP) {
      // Error: OTP not found
      return res.status(404).json({ message: "Connot find OTP Request" });
    } else if (foundOTP.otp !== otp) {
      // Error: OTP not matched
      return res.status(404).json({ message: "Invalid OTP" });
    } else if (foundOTP.expiresAt < new Date()) {
      // Error: OTP Expired
      return res.status(404).json({ message: "OTP Expired" });
    } else {
      // Success: OTP Verified
      foundOTP.otpverified = true;
      const savedOTP = await foundOTP.save();
      if (!savedOTP) {
        // Error: Cannot save the OTP
        return res.status(500).json({ message: "Cannot save the OTP" });
      } else {
        return res.status(200).json({ message: "OTP Verified" });
      }
    }
  } catch (e) {
    // Error:
    return res.status(500).json({ message: "Server Error" });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { password }: { password: string } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  if (!token || !password) {
    // Error: Incomplete Data
    return res.status(401).json({ message: "Incomplete Data" });
  }

  // Verify the token
  const decoded = jwt.verify(token, SecretKey) as jwt.JwtPayload;

  // Find the OTP in the database
  const foundOTP = await otpModel.findById({ _id: decoded.id });

  if (!foundOTP) {
    // Error: OTP not found
    return res.status(404).json({ message: "Connot find OTP Request" });
  } else if (foundOTP.otpverified === false) {
    // Error: OTP not verified
    return res.status(404).json({ message: "OTP not verified" });
  } else if (foundOTP.user === "company") {
    // Find the company in the database
    const foundCompany = await CompanyModel.findById({
      _id: foundOTP.user_id,
    });
    if (!foundCompany) {
      // Error: Company not found
      return res.status(404).json({ message: "Invalid User" });
    } else {
      // Hash the password
      const saltRounds = 10;
      bcrypt.hash(password, saltRounds).then(async (hashedPassword) => {
        // Set the password
        foundCompany.password = hashedPassword;

        // Save the password in the database
        const passwordSet = await foundCompany.save();

        if (passwordSet) {
          //Success: if password is set successfully
          return res
            .status(200)
            .json({ message: "Password updated successfully" });
        } else {
          // If password cannot be set
          return res
            .status(500)
            .json({ message: "Cannot set the password in database" });
        }
      });
    }
  } else if (foundOTP.user === "officer") {
    // Find the officer in the database
    const foundOfficer = await OfficerModel.findById({
      _id: foundOTP.user_id,
    });

    if (!foundOfficer) {
      // Error: Officer not found
      return res.status(404).json({ message: "Invalid User" });
    } else {
      // Hash the password
      const saltRounds = 10;
      // Set the password
      bcrypt.hash(password, saltRounds).then(async (hashedPassword) => {
        // Set the password
        foundOfficer.password = hashedPassword;

        // Save the password in the database
        const passwordSet = await foundOfficer.save();

        if (passwordSet) {
          //Success: if password is set successfully
          return res
            .status(200)
            .json({ message: "Password updated successfully" });
        } else {
          // If password cannot be set
          return res
            .status(500)
            .json({ message: "Cannot set the password in database" });
        }
      });
    }
  } else {
    return res.status(404).json({ message: "Invalid User" });
  }
};
