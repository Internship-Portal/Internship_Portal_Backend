import { Request, Response, NextFunction } from "express";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";
import { sendEmail } from "./officer";
import CompanyModel, { Company } from "../models/company";
import {
  createCompany,
  findCompany,
  deleteCompany,
  findAndUpdate,
} from "../services/company.service";
import OfficerModel from "../models/officer";

// login Company in the Backend Controller
export const loginCompanyController = async (req: Request, res: Response) => {
  try {
    if (!req.body.email_id) {
      // Error:
      return res.status(400).json({ message: "Email not found" });
    } else if (!req.body.password) {
      // Error:
      return res.status(400).json({ message: "password not found" });
    } else {
      // Find the company
      let { email_id, password } = req.body;
      const data = await CompanyModel.find({ email_id: email_id });
      if (data.length !== 0) {
        // bcrypt the password
        let foundCompany = data[0];
        const hashedPassword = foundCompany.password;
        bcrypt.compare(password, hashedPassword).then((results) => {
          if (results) {
            const tokenData = foundCompany._id;
            const token = jwt.sign({ tokenData }, SecretKey);
            // Success
            return res.status(200).send({
              message: "Login Successful",
              data: foundCompany,
              token: token,
            });
          } else {
            // Error:
            return res.status(404).json({ message: "Wrong Password " });
          }
        });
      } else {
        // Error:
        return res.status(404).json({ message: "Company does not exist" });
      }
    }
  } catch (e) {
    // Error:
    return res.status(500).json({ message: "Server Error" });
  }
};

// verify Company by Token got from frontend
export const verifyCompanyByToken = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      // Success :
      return res.status(200).send({
        message: "Login by token Successful",
        data: tokenVerify,
      });
    } else {
      // Error:
      res.status(400).json({ message: "Cannot verify token" });
    }
  } catch (e) {
    // Error:
    return res.status(500).json({ message: "Problem in verifying the token" });
  }
};

// Create Company Controller
export const createCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    let {
      username,
      email_id,
      password,
      mobile_no,
      company_name,
      company_description,
    } = req.body;
    if (
      !username ||
      !email_id ||
      !mobile_no ||
      !password ||
      !company_name ||
      !company_description
    ) {
      // Data Imcomplete
      return res.status(400).json({ message: "Data Incomplete Error" });
    } else if (!validator.isEmail(email_id)) {
      // Invalid Email id passed
      return res.status(400).json({ message: "Invalid Email" });
    } else if (!/^[a-z A-Z 0-9]*$/.test(username)) {
      // Invalid UserName
      return res
        .status(400)
        .json({ message: "username Should be in a-z A-Z 0-9 format" });
    } else if (password.length < 8) {
      // Password 8 characters
      return res
        .status(400)
        .json({ message: "password should be atleast 8 characters" });
    } else {
      email_id = email_id.trim();
      password = password.trim();
      // Find the email id exists or not in both.
      const company = await CompanyModel.find({ email_id: email_id });
      const officer = await OfficerModel.find({ email_id: email_id });

      if (company.length !== 0 || officer.length !== 0) {
        return res.status(400).json({
          message: "Officer or Company already Exists with this email id",
        });
      } else {
        // alloting the index.
        const lastCompany = await CompanyModel.findOne().sort({ _id: -1 });
        let index: number;

        if (lastCompany && lastCompany?.index === 0) {
          // if mistake happens and index get set to 0 then next will be stored as 1
          index = 1;
        } else if (lastCompany) {
          // adding 1 to the previous company index and storing it in our new Company
          index = Number.isNaN(lastCompany.index) ? 0 : lastCompany.index + 1;
        } else {
          index = 1; // Default index when no company is found
        }
        // password hashing using bcrypt
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds).then((hashedPassword) => {
          createCompany({
            index: index,
            username: username,
            password: hashedPassword,
            email_id: email_id,
            mobile_no: mobile_no,
            company_name: company_name,
            company_description: company_description,
            subscribe_request_from_officer: [],
            subscribe_request_to_officer: [],
            subscribed_officer: [],
            cancelled_officer: [],
            selected_students: [],
          }).then((company) => {
            // Success:
            return res.status(200).json({
              message: "This is Company's Create Page",
            });
          });
        });
      }
    }
  } catch (e) {
    // Error:
    return res.status(500).json({ message: "Server Error" });
  }
};

// Forget Password OTP email send function.
export const otpEmailSendController = async (req: Request, res: Response) => {
  try {
    const OTP = Math.floor(Math.random() * 9000 + 1000);
    const findUser = await CompanyModel.find({ email_id: req.body.email_id });

    if (findUser.length !== 0) {
      const token = jwt.sign(
        { OTP: OTP, email_id: req.body.email_id },
        SecretKey
      );
      // Send Email Function
      sendEmail(req, OTP, findUser[0].username)
        .then((response) => {
          // Success
          res.status(200).json({ message: response, token: token });
        })
        .catch((error) => res.status(500).json({ error: error.message }));
    } else {
      // Error:
      return res.status(404).json({ message: "User not Found" });
    }
  } catch (e) {
    // Error:
    return res.status(500).json({ message: "Internal Server Error", error: e });
  }
};

export const forgetPasswordController = async (req: Request, res: Response) => {
  try {
    // access the header
    const bearerHeader = req.headers.authorization;
    const { email_id, password } = req.body;
    if (bearerHeader !== undefined) {
      const bearer: string = bearerHeader as string;
      // verify the token got from frontend
      const tokenVerify = jwt.verify(
        bearer.split(" ")[1],
        SecretKey
      ) as jwt.JwtPayload;
      if (password && email_id && tokenVerify.email_id === email_id) {
        // find the user in database
        const findUser = await CompanyModel.find({ email_id: email_id });
        if (findUser.length !== 0) {
          // Password Hashing using bcrypt.
          const saltRounds = 10;
          bcrypt.hash(password, saltRounds).then(async (hashedPassword) => {
            findUser[0].password = hashedPassword;
            const passwordSet = await findUser[0].save();
            if (passwordSet) {
              //Success: if password is set successfully
              return res
                .status(200)
                .json({ message: "Password updated successfully" });
            } else {
              // If password cannot be set
              return res
                .status(500)
                .json({ message: "Cannot set the password in database" });
            }
          });
        } else {
          //Error: user not found
          return res.status(404).json({ message: "User not Found" });
        }
      } else {
        //Error: Token not valid.
        return res.status(404).json({ message: "password not found" });
      }
    } else {
      //Error: if Header not found.
      return res.status(404).json({ message: "Token not found" });
    }
  } catch (e) {
    //Error: if anything breaks
    return res
      .status(500)
      .json({ message: "Some error in setting new password" });
  }
};

// Find Get One Company by id Controller
export const findCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      // Find the officer
      const filter = { _id: req.params.id };
      let data = await findCompany(filter);
      return res.status(200).json({
        message: "This is Company's Find Page",
        data: data,
      });
    } else {
      // Error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // Error:
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get All Companies in Database Controller
export const getAllCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      // FInd all the details
      let data = await CompanyModel.find();
      if (data.length !== 0) {
        // Success:
        return res.status(200).json({
          message: "This is company's getAll Page",
          data: data,
        });
      } else {
        // Error:
        res.status(500).json({ message: "cannot find any company" });
      }
    } else {
      // Error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // Error:
    return res.status(500).json({ message: "Server Error" });
  }
};

// Delete Company by id Controller
export const deleteCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      // Find and Delete
      const filter = { _id: req.params.id };
      let data = await deleteCompany(filter);
      return res.status(200).json({
        message: "This is Company's Delete Page",
        data: data,
      });
    } else {
      // Error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // Error:
    return res.status(500).json({ message: "Server Error" });
  }
};

// Add subscribe request to Officer
export const addSubscribeRequestToOfficer = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // Find in company and officer
      let companydata = await CompanyModel.find({ _id: tokenVerify.tokenData });
      let officerData = await OfficerModel.find({ _id: req.body._id });
      if (officerData.length !== 0) {
        const dataCompany = {
          officer_id: req.body._id,
          index: officerData[0].index,
        };
        const dataOfficer = {
          company_id: companydata[0]._id,
          index: companydata[0].index,
        };

        // push the data in company in subscribe_request_to_officer
        companydata[0].subscribe_request_to_officer.push(dataCompany);

        // push the data in officer in subscribe_request_from_company
        officerData[0].subscribe_request_from_company.push(dataOfficer);

        // save
        const savedCompany = await companydata[0].save();
        const savedOfficer = await officerData[0].save();
        if (savedCompany && savedOfficer) {
          // successfully saved the data
          return res.status(200).json({ message: "Request Send" });
        } else {
          // error:
          return res.status(400).json({ message: "Request cannot send" });
        }
      } else {
        // error:
        return res.status(400).json({ message: "Officer does not exist" });
      }
    } else {
      // error:
      return res.status(400).json({ message: "Company does not exist" });
    }
  } catch (e) {
    // error:
    return res.status(500).json({ message: "Server Error" });
  }
};

// Add subscribed Officer
export const addSubscribedOfficerFromCompany = async (
  req: Request,
  res: Response
) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // Find
      const { officer_id } = req.body;
      const officer = await OfficerModel.find({ _id: officer_id });
      if (officer.length !== 0) {
        let companydata = await CompanyModel.find({
          _id: tokenVerify.tokenData,
        });

        // remove from the request send by officer
        companydata[0].subscribe_request_from_officer =
          companydata[0].subscribe_request_from_officer.filter(
            (obj) => obj.officer_id !== officer_id
          );

        // remove from the officer from which the request has came
        officer[0].subscribe_request_to_company =
          officer[0].subscribe_request_to_company.filter(
            (obj) => obj.company_id !== tokenVerify.tokenData
          );

        // add to the subscribedOfficer schema of company
        const companyData = {
          officer_id: officer_id,
          index: officer[0].index,
        };
        companydata[0].subscribed_officer.push(companyData);

        // add to the officer that requested to company
        const officerData = {
          company_id: companydata[0]._id,
          index: companydata[0].index,
          selectedstudents: [],
        };

        officer[0].subscribed_company.push(officerData);

        // save
        const savedOfficer = await companydata[0].save();
        const savedCompany = await officer[0].save();

        if (savedOfficer && savedCompany) {
          // Success
          return res
            .status(200)
            .json({ message: "Successfully subscribed the company" });
        } else {
          // error:
          return res
            .status(500)
            .json({ message: "Cannot subscribed the company" });
        }
      } else {
        // error:
        return res.status(400).json({ message: "Officer does not exist" });
      }
    } else {
      // error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // error:
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addCancelledRequest = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // Find the officer
      const { officer_id } = req.body;
      const officer = await OfficerModel.find({ _id: officer_id });
      if (officer.length !== 0) {
        // Find the company
        let company = await CompanyModel.find({ _id: tokenVerify.tokenData });

        // remove the requested data from officer
        officer[0].subscribe_request_to_company =
          officer[0].subscribe_request_to_company.filter(
            (obj) => obj.company_id !== tokenVerify.tokenData
          );

        // remove the requested data from company
        company[0].subscribe_request_from_officer =
          company[0].subscribe_request_from_officer.filter(
            (obj) => obj.officer_id !== officer_id
          );

        // add cancelled requested data to the officer
        const cancleOfficer = {
          company_id: company[0]._id,
          index: company[0].index,
        };
        officer[0].cancelled_company.push(cancleOfficer);

        // add cancelled requested data to the company
        const cancleCompany = {
          officer_id: officer[0]._id,
          index: officer[0].index,
        };
        company[0].cancelled_officer.push(cancleCompany);

        // save
        const savedCompany = await company[0].save();
        const savedOfficer = await officer[0].save();

        if (savedCompany && savedOfficer) {
          // Success
          return res.status(200).json({
            message: "Cancelled the company request",
          });
        } else {
          // error:
          return res.status(500).json({ message: "Cannot cancle request" });
        }
      } else {
        // error:
        return res.status(400).json({ message: "Company not found" });
      }
    } else {
      // error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // error:
    return res.status(500).json({ message: "Server Error" });
  }
};
