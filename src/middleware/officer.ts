import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";
import validator from "validator";
import { Students } from "../models/officer";

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

export const loginOfficerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { username, password } = req.body;

    const requiredFields = ["username", "password"];
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
    return res.status(400).json({ message: "Error in data send" });
  }
};

export const verifyOfficerTokenMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.body.tokenVerify = extractTokenData(req, res);
  // Success: Token Verified
  next();
};

export const createOfficerMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;
    let email_id = tokenVerify.email_id.toLowerCase();

    if (!email_id) {
      return res.status(400).json({ message: "Invalid Email" });
    }
    let {
      username,
      mobile_no,
      password,
      college_name,
    }: {
      username: string;
      mobile_no: string;
      password: string;
      college_name: string;
    } = req.body;

    const requiredFields = [
      "username",
      "mobile_no",
      "password",
      "college_name",
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

    if (!validator.isEmail(email_id)) {
      //Error: Invalid Email id passed
      return res.status(400).json({ message: "Invalid Email" });
    }

    if (password.length < 8) {
      //Error: Invalid Password passed
      return res
        .status(400)
        .json({ message: "password less than 8 characters" });
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

export const addDepartmentDetailsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;
    let { department_name, year_batch, college_details } = req.body;

    const requiredFields = ["department_name", "year_batch", "college_details"];

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

export const removeDepartmentDetailsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;
    let { department_id } = req.body;

    const requiredFields = ["department_id"];

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

export const addOneStudentDetailsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;
    let { student_details }: { student_details: Students } = req.body;

    const requiredFields = ["student_details"];

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

export const deleteOneStudentDetailsMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;
    let { branch, year_batch, index, roll_no } = req.body;

    if (!index || !roll_no) {
      return res
        .status(400)
        .json({ message: "Either the roll_no or index should be passed" });
    }

    const requiredFields = ["branch", "year_batch"];

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

export const convertStudentsCSVtoJSONMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;
    let { department_name, year_batch } = req.body;

    const requiredFields = ["department_name", "year_batch"];

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

export const getStudentDetailsbyDeptAndYearMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;
    let { department_name, year_batch } = req.body;

    const requiredFields = ["department_name", "year_batch"];

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

export const addSubscribeRequestToCompanyMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;
    let { _id, message } = req.body;

    const requiredFields = ["_id", "message"];

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

export const addCancelledRequestMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const tokenVerify: any = extractTokenData(req, res);
    req.body.tokenVerify = tokenVerify;
    let { company_id, message } = req.body;

    const requiredFields = ["company_id", "message"];

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
