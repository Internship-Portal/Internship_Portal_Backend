import { Response, Request } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import userModel from "../models/User";
import { generateToken, verifyToken } from "../config/User";
import { sendRegisterMail } from "../config/SES";
import {
  loginInterface,
  userCreateFirstInterface,
  userCreateSecondInterface,
  userInterface,
  userPaymentInterface,
} from "../interfaces/User";
import paymentModel from "../models/Payment";

require("dotenv").config();

export const loginUserController = async (req: Request, res: Response) => {
  try {
    const { email, password }: loginInterface = req.body;
    let user: userInterface | null;

    if (email?.includes("@")) {
      user = await userModel.findOne({
        email: email,
      });
    } else {
      user = await userModel.findOne({
        username: email,
      });
    }

    if (user !== null) {
      bcrypt.compare(password, user?.password, (err, result) => {
        if (err) {
          // Error
          return res.status(500).json({ message: "Error Comparing Password" });
        }
        if (result) {
          if (!user?._id) {
            // Error
            return res.status(400).json({ message: "User ID is missing" });
          }

          // Generate Token
          const token = generateToken({
            id: user._id.toString(),
          });

          if (typeof token === "string") {
            // Success
            return res.status(200).json({
              message: "User Logged In",
              token: token,
              username: user.username,
              operations: user.operations,
              pincode: user.pincode,
            });
          }
        } else {
          // Error
          return res.status(400).json({ message: "Password Incorrect" });
        }
      });
    } else {
      return res.status(400).json({ message: "User Not Found" });
    }
  } catch (e) {
    res.status(500).json({ message: "Cannot Login" });
  }
};

export const verifyTokenController = async (req: Request, res: Response) => {
  try {
    const user: userInterface | null = await userModel.findById({
      _id: req.body._id,
    });

    if (!user) {
      //Error
      return res.status(400).json({ message: "User Not Found" });
    } else {
      // Success
      return res.status(200).json({ message: "Token Verified", user: user });
    }
  } catch (e) {
    return res.status(500).json({ message: "Cannot Verify Token" });
  }
};

export const uniqueUsernameController = async (req: Request, res: Response) => {
  try {
    const { username }: { username: string } = req.body;

    const user: userInterface | null = await userModel.findOne({
      username: username.toLowerCase(),
    });

    if (!user) {
      // Success
      return res.status(200).json({ message: "valid username" });
    } else {
      // Error
      return res.status(400).json({ message: "Username Already Exists" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Cannot Verify Token" });
  }
};

export const createUserFirstController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      username,
      password,
      email,
      orgName,
      phoneNumber,
      gstNumber,
      planID,
      representative,
    }: userCreateFirstInterface = req.body;

    const paymentDetails = await paymentModel.findOne({ id: planID });

    if (!paymentDetails?._id) {
      // Error
      return res.status(400).json({ message: "Payment Details Not Found" });
    }

    bcrypt.hash(password, 10, async (err, hash) => {
      if (err) {
        // Error
        return res.status(500).json({ message: "Error Hashing Password" });
      }
      try {
        // managing plan end date
        const currentDate = new Date();
        const planMonths = new Date(currentDate);

        if (paymentDetails.amount === Number(process.env.SIX_MONTHS_PRICE)) {
          planMonths.setMonth(currentDate.getMonth() + 6);
        }
        if (paymentDetails.amount === Number(process.env.TWELVE_YEAR_PRICE)) {
          planMonths.setMonth(currentDate.getMonth() + 12);
        }

        const user = await userModel.create({
          username: username.toLowerCase(),
          password: hash,
          email: email,
          orgName: orgName,
          phoneNumber: phoneNumber,
          gstNumber: gstNumber,
          planID: paymentDetails._id.toString(),
          operations: null,
          addressLine1: null,
          addressLine2: null,
          state: null,
          city: null,
          pincode: null,
          establishedDate: null,
          vision: null,
          mission: null,
          description: null,
          topClients: null,
          projects: null,
          representative: representative,
          planEndDate: planMonths,
          status: 35,
          logo: null,
          featureImages: null,
        });

        if (!user._id) {
          // Error
          return res.status(400).json({ message: "User ID is missing" });
        } else {
          // Create a cipher object for encryption
          if (
            process.env.ALGORITHM_CRYPTO &&
            process.env.IV_CRYPTO &&
            process.env.SECRET_KEY_CRYPTO
          ) {
            const cipher = crypto.createCipheriv(
              process.env.ALGORITHM_CRYPTO,
              process.env.SECRET_KEY_CRYPTO,
              process.env.IV_CRYPTO
            );

            // Encrypt the plain text
            let encryptedData = cipher.update(
              user._id.toString(),
              "utf-8",
              "hex"
            );
            encryptedData += cipher.final("hex");

            // const id: string = user._id.toString() || ""; // Use default value if _id is not available

            // Email to create profile
            sendRegisterMail({
              templateName: "createAccountTemplate",
              recipientEmail: email,
              name: representative,
              link: `${process.env.FRONTEND_URL}/register/${encryptedData}`,
            })
              .then(() => {
                // Success
                res.status(200).json({ message: "User Created" });
              })
              .catch((e) => {
                // Error
                return res.status(500).json({ message: "Cannot Send Email!" });
                //! needed to think on this
              });
          } else {
            return res
              .status(500)
              .json({ message: "Cannot Create User (env Missing)" });
          }
        }
      } catch (e: any) {
        // Error
        if (e?.code === 11000) {
          return res.status(400).json({ message: "User Already Exists" });
        } else {
          return res.status(500).json({ message: "Error Adding User in DB" });
        }
      }
    });
  } catch (e) {
    return res.status(500).json({ message: "Cannot Create User" });
  }
};

export const createUserSecondController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      operations,
      addressLine1,
      addressLine2,
      state,
      city,
      pincode,
      establishedDate,
      vision,
      mission,
      description,
      topClients,
      logo,
      featureImages,
    }: userCreateSecondInterface = req.body;

    const id: string = req.params.id;

    if (
      process.env.ALGORITHM_CRYPTO &&
      process.env.IV_CRYPTO &&
      process.env.SECRET_KEY_CRYPTO
    ) {
      // Create a decipher object for decryption
      const decipher = crypto.createDecipheriv(
        process.env.ALGORITHM_CRYPTO,
        process.env.SECRET_KEY_CRYPTO,
        process.env.IV_CRYPTO
      );

      // Decrypt the encrypted data
      let decryptedData = decipher.update(id, "hex", "utf-8");
      decryptedData += decipher.final("utf-8");

      try {
        const user = await userModel.findById({ _id: decryptedData });

        if (!user) {
          // Error
          return res.status(400).json({ message: "User Not Found" });
        }

        user.operations = operations;
        user.addressLine1 = addressLine1;
        user.addressLine2 = addressLine2;
        user.state = state;
        user.city = city;
        user.pincode = pincode;
        user.establishedDate = establishedDate;
        user.vision = vision;
        user.mission = mission;
        user.projects = [];
        user.description = description;
        user.topClients = topClients;
        user.status = 100;
        user.logo = logo;
        user.featureImages = featureImages;

        await user.save();

        // Success
        return res
          .status(200)
          .json({ message: "User Profile Successfully Created" });
      } catch (e: any) {
        // Error
        res.status(500).json({ message: "Cannot Update the Profile" });
      }
    } else {
      return res
        .status(500)
        .json({ message: "Cannot Create Profile (env Missing)" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Cannot Create Profile" });
  }
};

export const postUserPaymentController = async (
  req: Request,
  res: Response
) => {
  try {
    const { _id, planID }: userPaymentInterface = req.body;

    const paymentDetails = await paymentModel.findOne({ id: planID });

    if (!paymentDetails) {
      // Error
      return res.status(400).json({ message: "Payment Details Not Found" });
    }

    const user = await userModel.findById({ _id: _id });

    if (!user) {
      // Error
      return res.status(400).json({ message: "User Not Found" });
    }

    // managing plan end date
    const currentDate = new Date();
    const planMonths = new Date(currentDate);

    if (paymentDetails.amount === Number(process.env.SIX_MONTHS_PRICE)) {
      planMonths.setMonth(currentDate.getMonth() + 6);
    }
    if (paymentDetails.amount === Number(process.env.TWELVE_YEAR_PRICE)) {
      planMonths.setMonth(currentDate.getMonth() + 12);
    }

    user.planID = paymentDetails._id.toString();
    user.planEndDate = planMonths;

    const savedUser = await user.save();

    if (!savedUser.planID) {
      // Success
      return res.status(200).json({ message: "Payment Successful" });
    } else {
      // Error
      return res.status(400).json({ message: "Payment Failed" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Cannot Create Payment" });
  }
};

export const getUserByUsernameController = async (
  req: Request,
  res: Response
) => {
  try {
    const user = await userModel
      .findOne({ username: req.params.username })
      .populate("projects")
      .select(
        "-password -id -_id -status -planEndDate -createdAt -updatedAt -__v -planID"
      );
    if (!user) {
      // Error
      return res.status(400).json({ message: "User Not Found" });
    } else {
      // Success
      return res.status(200).json({
        message: "User Found Successfully",
        data: user,
      });
    }
  } catch (e: any) {
    return res.status(500).json({ message: "Cannot Get User" });
  }
};

export const getProfileStatusController = async (
  req: Request,
  res: Response
) => {
  try {
    const id: string = req.params.id;
    if (
      process.env.ALGORITHM_CRYPTO &&
      process.env.IV_CRYPTO &&
      process.env.SECRET_KEY_CRYPTO
    ) {
      // Create a decipher object for decryption
      const decipher = crypto.createDecipheriv(
        process.env.ALGORITHM_CRYPTO,
        process.env.SECRET_KEY_CRYPTO,
        process.env.IV_CRYPTO
      );

      // Decrypt the encrypted data
      let decryptedData = decipher.update(id, "hex", "utf-8");
      decryptedData += decipher.final("utf-8");

      const user = await userModel.findById({ _id: decryptedData });
      if (!user) {
        // Error
        return res.status(400).json({ message: "User Not Found" });
      } else {
        // Success
        return res.status(200).json({ status: user.status });
      }
    } else {
      return res
        .status(500)
        .json({ message: "Cannot Find user (env Missing)" });
    }
  } catch (e: any) {
    return res.status(500).json({ message: "Cannot Get Profile Status" });
  }
};

