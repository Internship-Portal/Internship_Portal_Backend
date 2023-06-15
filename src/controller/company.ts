import { Request, Response } from "express";
import { Types } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SecretKey = "zaignAp12KbAt6N30KmSyHnAb";

import CompanyModel, { Company } from "../models/company";
import {
  createCompany,
  findCompany,
  deleteCompany,
  findAndUpdate,
} from "../services/company.service";

// login Company in the Backend Controller
export const loginCompanyController = (req: Request, res: Response) => {
  try {
    if (!req.body.email_id) {
      return res.status(400).json({ message: "Email not found" });
    } else if (!req.body.password) {
      return res.status(400).json({ message: "password not found" });
    } else {
      let { email_id, password } = req.body;
      email_id = email_id.trim();
      password = password.trim();
      CompanyModel.find({ email_id: email_id }).then((data) => {
        let foundCompany = data[0];
        if (data && foundCompany.password) {
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
              return res
                .status(404)
                .json({ message: "Wrong Password or Password Error" });
            }
          });
        } else {
          return res.status(404).json({ message: "Server Error" });
        }
      });
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
    if (
      !req.body.username ||
      !req.body.email_id ||
      !req.body.mobile_no ||
      !req.body.password ||
      !req.body.company_name ||
      !req.body.company_description
    ) {
      return res.status(400).json({ message: "Data Incomplete Error" });
    } else if (!/^[a-z A-Z 0-9]*$/.test(req.body.username)) {
      return res.status(400).json({ message: "username Error" });
    } else if (req.body.password < 8) {
      return res.status(400).json({ message: "password Error" });
    } else {
      let {
        username,
        email_id,
        password,
        mobile_no,
        company_name,
        company_description,
      } = req.body;
      email_id = email_id.trim();
      password = password.trim();
      const officer = await CompanyModel.find({ email_id });
      if (officer.length !== 0) {
        return res.status(400).json({ message: "Company already Exists" });
      } else {
        // password hashing using bcrypt
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds).then((hashedPassword) => {
          createCompany({
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
          })
            .then((company) => {
              return res.status(200).json({
                message: "This is Company's Create Page",
                data: company,
              });
            })
            .catch((e) => {
              return res
                .status(500)
                .json({ message: "error while hashing the password" });
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
