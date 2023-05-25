import { Request, Response } from "express";
import { Types } from "mongoose";
import CompanyModel, { Company } from "../models/company";
import {
  createCompany,
  findCompany,
  deleteCompany,
  findAndUpdate,
} from "../services/company.service";

export const createCompanyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const company = await createCompany({
      _id: new Types.ObjectId(),
      name: req.body.name,
      email_id: req.body.email_id,
      companydescription: req.body.companydescription,
      detailsOfficer: [],
    });
    res.status(200).json({
      message: "This is Company's Create Page",
      data: company,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const findCompanyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filter = { _id: req.params.id };
    let data = await findCompany(filter);
    res.status(200).json({
      message: "This is Company's Find Page",
      data: data,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteCompanyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filter = { _id: req.params.id };
    let data = await deleteCompany(filter);
    res.status(200).json({
      message: "This is Company's Delete Page",
      data: data,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const addOfficerDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filter = { _id: req.params.id };
    let data = await findAndUpdate(
      filter,
      { $push: { detailsOfficer: req.body.detailsOfficer } },
      { new: true }
    );
    res.status(200).json({
      message: "This is Company's department access details page",
      data: data,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};
export const removeOfficerDetailsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const filter = { _id: req.params.id };
    const detailsOfficerId = req.body._id;
    let data = await findAndUpdate(
      filter,
      { $pull: { detailsOfficer: { _id: detailsOfficerId } } },
      { new: true }
    );
    res.status(200).json({
      message: "This is Company's department remove details page",
      data: data,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};

export const getAllCompanyController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let data = await CompanyModel.find();
    res.status(200).json({
      message: "This is company's getAll Page",
      data: data,
    });
  } catch (e) {
    res.status(500).json({ message: "Server Error" });
  }
};
