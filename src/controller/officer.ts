import { Request, Response } from "express";
import { Types } from "mongoose";
import OfficerModel, { Officer } from "../models/officer";
import {
  createOfficer,
  findOfficer,
  deleteOfficer,
  findAndUpdate,
} from "../services/officer.service";

export const createOfficerController = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const user = await createOfficer({
      name: req.body.name,
      imageURL: req.body.imageURL,
      mobile_no: req.body.mobile_no,
      email_id: req.body.email_id,
      college_name: req.body.college_name,
      college_details: [],
      subscribeRequest: [],
      subscribedCompany: [],
      sharedtoCompany: [],
    });
    return res.status(200).json({
      message: "This is Officer Create Page",
      data: user,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const findOfficerController = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const filter = { _id: req.params.id };
    let data = await findOfficer(filter);
    return res.status(200).json({
      message: "This is Officer findone Page",
      data: data,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const deleteOfficerController = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const filter = { _id: req.params.id };
    let data = await deleteOfficer(filter);
    return res.status(200).json({
      message: "This is Officer Delete Page",
      data: data,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllOfficerController = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  let data = await OfficerModel.find();
  return res.json({
    message: "This is Officer getAll page",
    data: data,
  });
};

export const addCollegeDetails = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const filter = { _id: req.params.id };
    let data = await findAndUpdate(
      filter,
      { $push: { college_details: req.body.college_details } },
      { new: true }
    );
    return res.status(200).json({
      message: "This is Officer addCollegeDetails page",
      data: data,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const removeCollegeDetails = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const filter = { _id: req.params.id };
    const collegeDetailsId = req.body._id;
    let data = await findAndUpdate(
      filter,
      { $pull: { college_details: { _id: collegeDetailsId } } },
      { new: true }
    );
    return res.status(200).json({
      message: "This is Officer removeCollegeDetails page",
      data: data,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addCompanySharedDetails = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const filter = { _id: req.params.id };
    let data = await findAndUpdate(
      filter,
      { $push: { sharedCompany: req.body.sharedCompany } },
      { new: true }
    );
    return res.status(200).json({
      message: "This is Officer addCompanySharedDetails page",
      data: data,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const removeCompanySharedDetails = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const filter = { _id: req.params.id };
    const sharedDetailsId = req.body._id;
    let data = await findAndUpdate(
      filter,
      { $pull: { details_shared: { _id: sharedDetailsId } } },
      { new: true }
    );
    return res.status(200).json({
      message: "This is Officer removeCompanySharedDetails page",
      data: data,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};
