import { NextFunction, Request, Response } from "express";
import { verifyToken } from "../config/User";
import {
  loginInterface,
  userCreateFirstInterface,
  userCreateSecondInterface,
  userPaymentInterface,
} from "../interfaces/User";

export const userLoginMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password }: loginInterface = req.body;

    const requiredFields = ["email", "password"];
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      // Error
      return res.status(400).json({
        message: `The following fields are required: ${missingFields.join(
          ", "
        )}`,
      });
    }

    if (!email.includes("@")) {
      const regex = /^[a-z0-9]+$/;
      if (!regex.test(email)) {
        // Error
        return res.status(400).json({ message: "Invalid Username" });
      }
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Error in Middleware" });
  }
};

export const userVerifyTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      // Error
      return res.status(400).json({ message: "Token is required" });
    }
    const decoded = verifyToken(token);
    if (typeof decoded === "string") {
      // Error
      return res.status(400).json({ message: "Invalid Token" });
    }
    if (!decoded.id) {
      // Error
      return res.status(400).json({ message: "Invalid Token" });
    }
    req.body._id = decoded.id;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error in Middleware" });
  }
};

export const uniqueUsernameMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const username: string = req.body.username;
    if (!username) {
      // Error
      return res.status(400).json({ message: "Username is required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error in Middleware" });
  }
};

export const userCreateFirstMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
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
    }: userCreateFirstInterface = req.body;
    const requiredFields = [
      "username",
      "password",
      "email",
      "orgName",
      "phoneNumber",
      "gstNumber",
      "planID",
      "representative",
    ];
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      // Error
      return res.status(400).json({
        message: `The following fields are required: ${missingFields.join(
          ", "
        )}`,
      });
    }

    const regex = /^[a-z0-9]+$/;
    if (!regex.test(username)) {
      // Error
      return res.status(400).json({ message: "Invalid Username" });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Error in Middleware" });
  }
};

export const userCreateSecondMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
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

    if (!id) {
      return res.status(400).json({ message: "User ID is missing" });
    }

    const requiredFields = [
      "operations",
      "addressLine1",
      "addressLine2",
      "state",
      "city",
      "pincode",
      "establishedDate",
      "vision",
      "mission",
      "description",
      "topClients",
      "logo",
      "featureImages",
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      // Error
      return res.status(400).json({
        message: `The following fields are required: ${missingFields.join(
          ", "
        )}`,
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error in Middleware" });
  }
};

export const userPaymentMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { _id, planID }: userPaymentInterface = req.body;
    const requiredFields = ["_id", "planID"];
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      // Error
      return res.status(400).json({
        message: `The following fields are required: ${missingFields.join(
          ", "
        )}`,
      });

      next();
    }
  } catch (error) {
    return res.status(500).json({ message: "Error in Middleware" });
  }
};

export const getUsernameMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const username: string = req.params.username;
    if (!username) {
      // Error
      return res.status(400).json({ message: "Username is required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error in Middleware" });
  }
};

export const getProfileStatusMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id: string = req.params.id;
    if (!id) {
      // Error
      return res.status(400).json({ message: "id is required" });
    }
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error in Middleware" });
  }
};
