import { Request, Response } from "express";
import { Types } from "mongoose";
import OfficerModel from "../models/officer";
import {
  createOfficer,
  findOfficer,
  deleteOfficer,
} from "../services/users.service";

export const createOfficerController = async (req: Request, res: Response) => {
  const user = await createOfficer({
    _id: new Types.ObjectId(),
    name: "Name",
    email_id: "emailid@gmail.com",
    college_name: "Dummy_Clg",
    details: [
      {
        _id: new Types.ObjectId(),
        name: "IT_Dept",
        student_details: [
          {
            _id: new Types.ObjectId(),
            name: "Student 1",
            cgpa: 9.12,
            year_batch: 2024,
          },
          {
            _id: new Types.ObjectId(),
            name: "Student 2",
            cgpa: 8.9,
            year_batch: 2024,
          },
          {
            _id: new Types.ObjectId(),
            name: "Student 3",
            cgpa: 7.89,
            year_batch: 2024,
          },
          {
            _id: new Types.ObjectId(),
            name: "Student 4",
            cgpa: 9.01,
            year_batch: 2024,
          },
          {
            _id: new Types.ObjectId(),
            name: "Student 5",
            cgpa: 5.78,
            year_batch: 2024,
          },
        ],
      },
    ],
  });
  res.json({
    message: "This is Officer Create Page",
    myData: user,
  });
};

export const findOfficerController = async (req: Request, res: Response) => {
  const filter = { _id: req.params.id };
  let data = await findOfficer(filter);
  res.json({
    message: "This is Officer Details Page",
    myData: data,
  });
};

export const deleteOfficerController = async (req: Request, res: Response) => {
  const filter = { _id: req.params.id };
  let data = await deleteOfficer(filter);
  res.json({
    message: "This is Officer Delete Page",
    myData: data,
  });
};
