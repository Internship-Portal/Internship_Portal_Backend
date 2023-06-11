import { Request, Response } from "express";
import OfficerModel, { Officer, Students, Department } from "../models/officer";
import csvtojson from "csvtojson";
import fs = require("fs");

import {
  createOfficer,
  findOfficer,
  deleteOfficer,
  findAndUpdate,
} from "../services/officer.service";
import { error } from "console";

// Create Officer in the Backend Controller
export const createOfficerController = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const user = await createOfficer({
      username: req.body.username,
      image: req.body.image,
      email_id: req.body.email_id,
      mobile_no: req.body.mobile_no,
      college_name: req.body.college_name,
      subscribed_company: [],
      cancelled_company: [],
      subscribe_request_from_company: [],
      subscribe_request_to_company: [],
      college_details: [],
    });
    return res.status(200).json({
      message: "This is Officer Create Page",
      data: user,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Find / Get One Officer by Id Controller
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

// Get All Officer Controller
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

// Delete Officer by Id Controller
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

// Add the Students details Department and batch wise
export const addDepartmentDetails = async (
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
      message: "This is Officer addDepartmentDetails page",
      data: data,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Remove the Student details Department and batch wise
export const removeDepartmentDetails = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const filter = { _id: req.params.id };
    const departmentDetailsId = req.body._id;
    let data = await findAndUpdate(
      filter,
      { $pull: { college_details: { _id: departmentDetailsId } } },
      { new: true }
    );
    return res.status(200).json({
      message: "This is Officer removeDepartmentDetails page",
      data: data,
    });
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addOneStudentDetails = async (req: Request, res: Response) => {
  try {
    const officerId: string = req.params.id;
    let newStudentDetails: Students = req.body;

    const officer: Officer | null = await OfficerModel.findById(officerId);

    if (!officer) {
      return res.status(404).json({ error: "Officer not found" });
    }

    let departmentFound = false;
    // Push the new student details to the college_details array
    officer.college_details.map((e) => {
      if (e.department_name === newStudentDetails.branch) {
        departmentFound = true;
        // Add the index value to the newStudentDetails
        if (e.student_details.length > 0) {
          newStudentDetails = {
            ...newStudentDetails,
            index: e.student_details[e.student_details.length - 1].index + 1,
          };
          e.student_details.push(newStudentDetails);
        } else {
          newStudentDetails = {
            ...newStudentDetails,
            index: 1,
          };
          e.student_details.push(newStudentDetails);
        }
      }
    });

    if (!departmentFound) {
      newStudentDetails = { ...newStudentDetails, index: 1 };
      const newDepartment: Department = {
        department_name: newStudentDetails.branch,
        year_batch: newStudentDetails.year_batch, // Set the desired value for year_batch
        student_details: [newStudentDetails],
      };
      officer.college_details.push(newDepartment);
    }

    // Save the updated officer document
    await officer.save();

    return res.json({
      message: "One Student details added successfully",
      data: officer,
    });
  } catch (err) {
    return res.status(500).json({
      message: "An Error Occured while adding the student details",
      error: err,
    });
  }
};

// Delete One student data from the department in the student details
export const deleteOneStudentDetails = async (req: Request, res: Response) => {
  try {
    const officerId: string = req.params.id;
    const departmentName: string = req.body.branch;
    const studentIndex: number = parseInt(req.body.index);

    const officer: Officer | null = await OfficerModel.findById(officerId);

    if (!officer) {
      return res.status(404).json({ error: "Officer not found" });
    }

    let departmentFound = false;
    let departmentIndex = -1;

    // Find the department by name
    officer.college_details.forEach((department, index) => {
      if (department.department_name === departmentName) {
        departmentFound = true;
        departmentIndex = index;
      }
    });

    if (!departmentFound) {
      return res.status(404).json({ error: "Department not found" });
    }

    const department = officer.college_details[departmentIndex];

    // Find the student by index
    const studentIndexToDelete = department.student_details.findIndex(
      (student) => student.index === studentIndex
    );

    if (studentIndexToDelete === -1) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Remove the student from the department
    department.student_details.splice(studentIndexToDelete, 1);

    // Save the updated officer document
    await officer.save();

    return res.json({
      message: "One student details deleted successfully",
      data: officer,
    });
  } catch (e) {
    return res.status(500).json({
      message: "An Error Occured while removing the student details",
      error: e,
    });
  }
};

// Access the Local CSV file and convert it to the JSON format

export const convertCSVtoJSON = (req: Request, res: Response) => {
  let csvFilePath;
  if (req.file) csvFilePath = req.file.path;
  if (csvFilePath) {
    csvtojson()
      .fromFile(csvFilePath)
      .then((json) => {
        console.log(json);
        return res.status(200).json({ data: json });
      });
  }
  return res.status(200);
};
