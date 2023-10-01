import { Response, Request } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";

import { userInterface } from "../interfaces/User";
import userModel from "../models/User";
import { sendRecoveryMail } from "../config/SES";
import recoveryModel from "../models/Recovery";

require("dotenv").config();

export const recoverUsernameController = async (
  req: Request,
  res: Response
) => {
  try {
    const { email_id }: { email_id: string } = req.body;

    const user: userInterface | null = await userModel.findOne({
      email: email_id,
    });

    if (user) {
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
          // const id: string = user._id.toString() || ""; // Use default value if _id is not available

          const recoveryData = await recoveryModel.create({
            user_id: user._id,
            type: "username",
            user: user.representative,
            userverified: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });

          if (!recoveryData._id) {
            return res
              .status(500)
              .json({ message: "Internal Server Error (recoveryData)" });
          }

          const cipher = crypto.createCipheriv(
            process.env.ALGORITHM_CRYPTO,
            process.env.SECRET_KEY_CRYPTO,
            process.env.IV_CRYPTO
          );

          // Encrypt the plain text
          let encryptedData = cipher.update(
            recoveryData._id.toString(),
            "utf-8",
            "hex"
          );
          encryptedData += cipher.final("hex");

          // Email to create profile
          sendRecoveryMail({
            templateName: "recoveryAccountTemplate",
            recipientEmail: email_id,
            name: user.representative,
            link: `${process.env.FRONTEND_URL}/forgot/username/${encryptedData}`,
          })
            .then(() => {
              console.log(encryptedData);
              // Success
              res.status(200).json({ message: "Mail Sended" });
            })
            .catch((e) => {
              // Error
              return res.status(500).json({ message: "Cannot Send Email!" });
              //! needed to think on this
            });
        } else {
          return res
            .status(500)
            .json({ message: "Internal Server Error (env)" });
        }
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const recoverPasswordController = async (
  req: Request,
  res: Response
) => {
  try {
    const { email_id }: { email_id: string } = req.body;

    const user: userInterface | null = await userModel.findOne({
      email: email_id,
    });

    if (user) {
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
          // const id: string = user._id.toString() || ""; // Use default value if _id is not available

          const recoveryData = await recoveryModel.create({
            user_id: user._id,
            type: "password",
            user: user.representative,
            userverified: false,
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          });

          if (!recoveryData._id) {
            return res
              .status(500)
              .json({ message: "Internal Server Error (recoveryData)" });
          }

          const cipher = crypto.createCipheriv(
            process.env.ALGORITHM_CRYPTO,
            process.env.SECRET_KEY_CRYPTO,
            process.env.IV_CRYPTO
          );

          // Encrypt the plain text
          let encryptedData = cipher.update(
            recoveryData._id.toString(),
            "utf-8",
            "hex"
          );
          encryptedData += cipher.final("hex");

          // Email to create profile
          sendRecoveryMail({
            templateName: "recoveryAccountTemplate",
            recipientEmail: email_id,
            name: user.representative,
            link: `${process.env.FRONTEND_URL}/forgot/password/${encryptedData}`,
          })
            .then(() => {
              console.log(encryptedData);
              // Success
              res.status(200).json({ message: "Mail Sended" });
            })
            .catch((e) => {
              // Error
              return res.status(500).json({ message: "Cannot Send Email!" });
              //! needed to think on this
            });
        } else {
          return res
            .status(500)
            .json({ message: "Internal Server Error (env)" });
        }
      }
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const recoverAccountController = async (req: Request, res: Response) => {
  try {
    const { data }: { data: string } = req.body;
    const id: string = req.params.id;

    // Create a decipher object
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
        console.log(decryptedData);
        const recoveryData = await recoveryModel.findById({
          _id: decryptedData,
        });

        if (!recoveryData) {
          // Error
          return res.status(400).json({ message: "Recovery Not Found" });
        }

        if (recoveryData.userverified) {
          // Error
          return res
            .status(400)
            .json({ message: "User Already Responded to the Data" });
        } else {
          if (recoveryData.type === "username") {
            const regex = /^[a-z0-9]+$/;
            if (!regex.test(data)) {
              // Error
              return res.status(400).json({ message: "Invalid Username" });
            } else {
              try {
                const user = await userModel.findById({
                  _id: recoveryData.user_id,
                });
                if (!user) {
                  return res.status(400).json({ message: "User Not Found" });
                } else {
                  user.username = data;
                  await user.save();
                  recoveryData.userverified = true;
                  await recoveryData.save();
                  return res.status(200).json({ message: "Username Updated" });
                }
              } catch (e) {
                return res
                  .status(500)
                  .json({ message: "Internal Server Error" });
              }
            }
          } else {
            try {
              const user = await userModel.findById({
                _id: recoveryData.user_id,
              });
              if (!user) {
                return res.status(400).json({ message: "User Not Found" });
              } else {
                bcrypt.hash(data, 10, async (err, hash) => {
                  if (err) {
                    return res
                      .status(500)
                      .json({ message: "Internal Server Error (brp)" });
                  }
                  user.password = hash;
                  await user.save();
                  recoveryData.userverified = true;
                  await recoveryData.save();
                  return res.status(200).json({ message: "Password Updated" });
                });
              }
            } catch (e) {
              return res.status(500).json({ message: "Internal Server Error" });
            }
          }
        }
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
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
