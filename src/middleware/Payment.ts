import { Request, Response, NextFunction } from "express";

export const orderMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, emailID } = req.body;
    const requiredFields = ["amount", "emailID"];
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

export const verifyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { orderId, paymentId, signature, emailID, id } = req.body;
    const requiredFields = [
      "orderId",
      "paymentId",
      "signature",
      "emailID",
      "id",
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
