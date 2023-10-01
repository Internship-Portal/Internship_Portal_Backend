import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../config/User";
import {
  createProjectStep1Interface,
  createProjectStep2Interface,
} from "../interfaces/Project";

export const normalToken = (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      // Error
      res.status(400).json({ message: "Token is required" });
      return undefined;
    }
    const decoded = verifyToken(token);
    if (typeof decoded === "string") {
      // Error
      res.status(400).json({ message: "Invalid Token" });
      return undefined;
    }
    if (!decoded.id) {
      // Error
      res.status(400).json({ message: "Invalid Token" });
      return undefined;
    }

    return decoded;
  } catch (error) {
    res.status(400).json({ message: "Invalid Token" });
    return undefined;
  }
};

export const createProjectStep1Middleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData: any = normalToken(req, res);
    if (tokenData === undefined) return;
    req.body._id = tokenData.id;

    const {
      operation,
      title,
      quantity,
      startprice,
      endprice,
      expectedDate,
      visibility_time,
    }: createProjectStep1Interface = req.body;

    const requiredFields = [
      "operation",
      "title",
      "quantity",
      "startprice",
      "endprice",
      "expectedDate",
      "visibility_time","pincode"
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

export const createProjectStep2Middleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData: any = normalToken(req, res);
    if (tokenData === undefined) return;
    req.body._id = tokenData.id;

    const { projectId, drawing, featureImages }: createProjectStep2Interface =
      req.body;

    const requiredFields = ["projectId", "drawing", "featureImages"];
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

export const checkUniqueTitleMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData: any = normalToken(req, res);
    if (tokenData === undefined) return;
    req.body._id = tokenData.id;

    const { title }: { title: string } = req.body;

    const requiredFields = ["title"];
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

    if (title.length < 3) {
      // Error
      return res.status(400).json({
        message: `Title must be atleast 3 characters`,
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ message: "Error in Middleware" });
  }
};

export const getProjectFiltersMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData: any = normalToken(req, res);

    if (tokenData === undefined) return;
    req.body._id = tokenData.id;

    // Check and validate query parameters
    const page = parseInt(req.query.page as string, 10);
    const limit = parseInt(req.query.limit as string, 10);

    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
      // Invalid query parameters
      return res.status(400).json({ message: "Invalid query parameters" });
    }

    req.body.page = page;
    req.body.limit = limit;

  

    next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error in Middleware" });
  }
};

export const getOneProjectMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData: any = normalToken(req, res);

    if (tokenData === undefined) return;
    req.body._id = tokenData.id;

    const { projectId }: { projectId: string } = req.body;

    const requiredFields = ["projectId"];
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

export const closeProjectBiddingMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenData: any = normalToken(req, res);

    if (tokenData === undefined) return;
    req.body._id = tokenData.id;


    const requiredFields = ["projectId"];
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