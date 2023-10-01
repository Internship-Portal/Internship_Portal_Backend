import { NextFunction, Request, Response } from "express";

export const sendVerificationEmailMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email_id }: { email_id: string } = req.body;
    if (!email_id) {
      return res.status(400).json({ message: "Email Id is required" });
    }
    next();
  } catch (e) {
    return res.status(500).json({ message: "Error in Details Provided" });
  }
};

export const verifyEmailMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email_id, otp }: { email_id: string; otp: string } = req.body;

    const requiredFields = ["email_id", "otp"];
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
  } catch (e) {
    return res.status(500).json({ message: "Error in Details Provided" });
  }
};
