import { NextFunction, Request, Response } from "express";

export const recoveryIntialMiddleware = async (
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

export const recoveryFinalMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { data }: { data: string } = req.body;
    const id: string = req.params.id;
    if (!id) {
      return res.status(400).json({ message: "Invalid Request" });
    }
    if (!data) {
      return res.status(400).json({ message: "No data found" });
    }
    next();
  } catch (e) {
    return res.status(500).json({ message: "Error in Details Provided" });
  }
};
