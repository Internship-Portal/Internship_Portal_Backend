import { Request, Response, NextFunction } from "express";
import { normalToken } from "./Project";

export const AddBiddingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData: any = normalToken(req, res);
    if (tokenData === undefined) return;
    req.body.userId = tokenData.id;

    const requiredFields = ["price", "projectId"];
    const missingFields: string[] = [];

    for (let field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      // Error
      return res.status(400).json({
        messafe: `The following fields are missing: ${missingFields.join(
          ", "
        )}`,
      });
    }

    next();
  } catch (e) {
    return res.status(500).json({ message: "Error in Middleware" });
  }
};

export const askForSampleMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData: any = normalToken(req, res);
    if (tokenData === undefined) return;
    req.body._id = tokenData.id;

    const requiredFields = ["biddingId"];
    const missingFields: string[] = [];

    for (let field of requiredFields) {
      if (!req.body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      // Error
      return res.status(400).json({
        messafe: `The following fields are missing: ${missingFields.join(
          ", "
        )}`,
      });
    }

    next();
  } catch (e) {
    return res.status(500).json({ message: "Error in Middleware" });
  }
};
