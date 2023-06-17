import { Request, Response } from "express";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";

import CompanyModel, { Company } from "../models/company";
import {
  createCompany,
  findCompany,
  deleteCompany,
  findAndUpdate,
} from "../services/company.service";

// login Company in the Backend Controller
export const loginCompanyController = async (req: Request, res: Response) => {
  try {
    if (!req.body.email_id) {
      return res.status(400).json({ message: "Email not found" });
    } else if (!req.body.password) {
      return res.status(400).json({ message: "password not found" });
    } else {
      let { email_id, password } = req.body;
      const data = await CompanyModel.find({ email_id: email_id });
      if (data.length !== 0) {
        let foundCompany = data[0];
        const hashedPassword = foundCompany.password;
        bcrypt.compare(password, hashedPassword).then((results) => {
          if (results) {
            const token = jwt.sign({ foundCompany }, SecretKey);
            return res.status(200).send({
              message: "Login Successful",
              data: foundCompany,
              token: token,
            });
          } else {
            return res.status(404).json({ message: "Wrong Password " });
          }
        });
      } else {
        return res.status(404).json({ message: "Company does not exist" });
      }
    }
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// verify Officer by Token got from frontend
export const verifyCompanyByToken = async (req: Request, res: Response) => {
  try {
    const tokenVerify = jwt.verify(req.body.token, SecretKey);
    if (tokenVerify) {
      return res.status(200).send({
        message: "Login by token Successful",
        data: tokenVerify,
      });
    } else {
      res.status(400).json({ message: "Cannot verify token" });
    }
  } catch (e) {
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
      console.log("This is true");
      return res
        .status(400)
        .json({ message: "password should be atleast 8 characters" });
    } else {
      email_id = email_id.trim();
      password = password.trim();
      // Find the email id exists or not.
      const officer = await CompanyModel.find({ email_id });
      if (officer.length !== 0) {
        return res.status(400).json({ message: "Company already Exists" });
      } else {
        // alloting the index.
        const lastCompany = await CompanyModel.findOne().sort({ _id: -1 });
        let index: number;

        if (lastCompany && lastCompany?.index === 0) {
          // if mistake happens and index get set to 0 then next will be stored as 1
          index = 1;
        } else if (lastCompany) {
          // adding 1 to the previous officer index and storing it in our new officer
          index = Number.isNaN(lastCompany.index) ? 0 : lastCompany.index + 1;
        } else {
          index = 1; // Default index when no officer is found
        }
        // password hashing using bcrypt
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds).then((hashedPassword) => {
          console.log(index);
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
            console.log(company);
            return res.status(200).json({
              message: "This is Company's Create Page",
              data: company,
            });
          });
        });
      }
    }
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Find Get One Company by id Controller
export const findCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const filter = { _id: req.params.id };
    let data = await findCompany(filter);
    return res.status(200).json({
      message: "This is Company's Find Page",
      data: data,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Get All Companies in Database Controller
export const getAllCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    let data = await CompanyModel.find();
    return res.status(200).json({
      message: "This is company's getAll Page",
      data: data,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Delete Company by id Controller
export const deleteCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const filter = { _id: req.params.id };
    let data = await deleteCompany(filter);
    return res.status(200).json({
      message: "This is Company's Delete Page",
      data: data,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Add subscribed Officer
