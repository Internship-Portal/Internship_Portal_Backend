import { Request, Response } from "express";
import { Types } from "mongoose";
import CompanyModel, { Company } from "../models/company";
import {
  createCompany,
  findCompany,
  deleteCompany,
  findAndUpdate,
} from "../services/company.service";

// Create Company Controller
export const createCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const company = await createCompany({
      username: req.body.username,
      imageurl: req.body.imageurl,
      email_id: req.body.email_id,
      mobile_no: req.body.mobile_no,
      company_name: req.body.company_name,
      company_description: req.body.company_description,
      subscribe_request_from_officer: [],
      subscribe_request_to_officer: [],
      subscribed_officer: [],
      cancelled_officer: [],
      selected_students: [],
    });
    return res.status(200).json({
      message: "This is Company's Create Page",
      data: company,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

// Find / Get One Company by id Controller
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
