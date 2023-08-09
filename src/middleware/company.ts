import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";
import validator from "validator";

const extractTokenData = (req: Request, res: Response) => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // Success: Token Verified
      return tokenVerify;
    } else {
      // Error: Problem in verifying
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // Error: Problem in server
    return res.status(500).json({ message: "Server Error" });
  }
};

export const loginCompanyControllerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    let { email_id, password } = req.body;

    const requiredFields = ["email_id", "password"];

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
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};

export const normalMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;
    next();
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};

export const createCompanyControllerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;
    let { username, password, mobile_no, company_name } = req.body;

    const requiredFields = [
      "username",
      "password",
      "mobile_no",
      "company_name",
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

    let email_id = tokenVerify.email_id.toLowerCase();

    if (!validator.isEmail(email_id)) {
      // Invalid Email
      return res.status(400).json({ message: "Invalid Email" });
    }

    if (password.length < 8) {
      // Password should be at least 8 characters
      return res
        .status(400)
        .json({ message: "Password should be at least 8 characters" });
    }

    if (!/^[a-z A-Z0-9]*$/.test(username)) {
      // Invalid UserName
      return res
        .status(400)
        .json({ message: "Username should be alphanumeric" });
    }

    next();
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addSubscribeRequestToOfficerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;

    let { _id } = req.body;

    const requiredFields = ["_id"];

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
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addSubscribedOfficerFromCompanyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;

    let { officer_id, message } = req.body;

    const requiredFields = ["officer_id", "message"];

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
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};

export const selectedStudentsByCompaniesWithoutDatesMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;

    let {
      officer_id,
      department_name,
      year_batch,
      selected_students,
      message,
    } = req.body;

    const requiredFields = [
      "officer_id",
      "department_name",
      "year_batch",
      "selected_students",
      "message",
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
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};

export const selectedStudentsByCompaniesWithDatesMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;

    let {
      officer_id,
      department_name,
      year_batch,
      start_date,
      end_date,
      selected_students,
      message,
    } = req.body;

    const requiredFields = [
      "officer_id",
      "department_name",
      "year_batch",
      "start_date",
      "end_date",
      "selected_students",
      "message",
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
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getdepartmentNotSelectedByCompanyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;

    let { officer_id } = req.body;

    const requiredFields = ["officer_id"];

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
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getStudentDetailsbyDeptAndYearByCompanyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;

    let { department_name, officer_id, year_batch } = req.body;

    const requiredFields = ["department_name", "officer_id", "year_batch"];

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
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllOfficerByFilterInChunksWithSearchMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;

    let { search } = req.body;

    const requiredFields = ["search"];

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
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};

export const setMessageMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;

    let { message, officer_id } = req.body;

    const requiredFields = ["message", "officer_id"];

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
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};
