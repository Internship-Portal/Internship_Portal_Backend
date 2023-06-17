import { NextFunction, Request, Response } from "express";
import validator from "validator";
import OfficerModel, { Officer, Students, Department } from "../models/officer";
import multer from "multer";
import csvtojson from "csvtojson";
import { promisify } from "util";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";

// Delete the upload folder that is created to upload a CSV
const deleteFolder = (folderPath: string) => {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach((file) => {
      const filePath = `${folderPath}/${file}`;
      if (fs.lstatSync(filePath).isDirectory()) {
        deleteFolder(filePath); // Recursively delete sub-folders and files
      } else {
        fs.unlinkSync(filePath); // Delete individual file
      }
    });
  }
};

// Usage
deleteFolder("uploads");

// Set up multer storage
const storage = multer({ dest: "uploads/" });

// Set up multer upload middleware
const upload = storage.single("csvFile");

import {
  createOfficer,
  findOfficer,
  deleteOfficer,
  findAndUpdate,
} from "../services/officer.service";

// login Officer in the Backend Controller
export const loginOfficerController = async (req: Request, res: Response) => {
  try {
    if (!req.body.email_id) {
      return res.status(400).json({ message: "Email not found" });
    } else if (!req.body.password) {
      return res.status(400).json({ message: "Password not found" });
    } else {
      let { email_id, password } = req.body;
      email_id = email_id.trim();
      password = password.trim();

      const data = await OfficerModel.find({ email_id: email_id });
      if (data.length !== 0) {
        let foundOfficer = data[0];
        const hashedPassword = foundOfficer.password;
        // comparing the password.
        bcrypt.compare(password, hashedPassword).then((results) => {
          if (results) {
            const token = jwt.sign(
              { data: data[0]._id, email_id: email_id },
              SecretKey
            );
            return res.status(200).send({
              message: "Login Successful",
              data: data[0]._id,
              token: token,
            });
          } else {
            return res.status(404).json({ message: "Wrong Password Error" });
          }
        });
      } else {
        return res.status(404).json({ message: "Officer does not exist" });
      }
    }
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

//verify Token function
export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearerHeader = req.headers["authentication"];
  if (bearerHeader !== undefined) {
    const bearer: string = bearerHeader as string;
    const token = bearer.split(" ")[1];
    if (!token) {
      return res.status(400).json({ message: "Unable to fetch token" });
    } else {
      req.body.token = token;
      next();
    }
  } else {
    return res.status(400).json({ message: "Invalid Token" });
  }
};

// verify Officer by Token got from frontend
export const verifyOfficerByToken = async (req: Request, res: Response) => {
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

// Create Officer in the Backend Controller
export const createOfficerController = async (req: Request, res: Response) => {
  try {
    let { username, email_id, mobile_no, password, college_name } = req.body;

    if (!username || !email_id || !mobile_no || !password || !college_name) {
      // anyone details not available
      return res.status(400).json({ message: "Data Incomplete Error" });
    } else if (!validator.isEmail(email_id)) {
      // Invalid Email id passed
      return res.status(400).json({ message: "Invalid Email" });
    } else if (password.length < 8) {
      // password less than 8 characters
      return res
        .status(400)
        .json({ message: "password less than 8 characters" });
    } else if (mobile_no.length < 5) {
      // mobile_no greater than 5 characters
      return res
        .status(400)
        .json({ message: "mobile_no greater than 5 characters" });
    } else {
      // checking if the Officer already exists in database
      email_id = email_id.trim();
      password = password.trim();
      const officer = await OfficerModel.find({ email_id });
      if (officer.length !== 0) {
        return res.status(400).json({ message: "Officer already Exists" });
      }

      // alloting the index.
      const lastOfficer = await OfficerModel.findOne().sort({ _id: -1 });
      let index: number;

      if (lastOfficer && lastOfficer.index === 0) {
        // if mistake happens and index get set to 0 then next will be stored as 1
        index = 1;
      } else if (lastOfficer) {
        // adding 1 to the previous officer index and storing it in our new officer
        index = lastOfficer.index + 1;
      } else {
        index = 1; // Default index when no officer is found
      }

      // Password Hashing using bcrypt
      const saltRounds = 10;
      bcrypt
        .hash(password, saltRounds)
        .then((hashedPassword) => {
          // finally creating and saving the officer
          createOfficer({
            index: index,
            username: username,
            email_id: email_id,
            password: hashedPassword,
            mobile_no: mobile_no,
            college_name: college_name,
            subscribed_company: [],
            cancelled_company: [],
            subscribe_request_from_company: [],
            subscribe_request_to_company: [],
            college_details: [],
          }).then((user) => {
            // then returning the Officer Id of the Officer.
            return res.status(200).json({
              message: "This is Officer Create Page",
              data: user?._id,
            });
          });
        })
        .catch((e) => {
          return res
            .status(500)
            .json({ message: "error while hashing the password" });
        });
    }
  } catch (error: any) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Find Get One Officer by Id Controller
export const findOfficerController = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    // finding the officer by the ID got from the frontend
    const filter = { _id: req.params.id };
    let data = await findOfficer(filter);

    // checking if the officer exists or not
    if (data.length === 0) {
      return res.status(404).json({ message: "Officer not found" });
    } else {
      const officer = data[0];

      // omiting the college details from officer
      const { college_details, password, ...responseData } = officer;

      return res.status(200).json({
        message: "This is Officer findone Page",
        data: responseData,
      });
    }
  } catch (e) {
    return res.status(500).json({ message: "Server Error" });
  }
};

// Get All Officer Controller
export const getAllOfficerController = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  let data = await OfficerModel.find().select(
    "-college_details -subscribe_request_from_company -subscribed_company -cancelled_company -subscribe_request_to_company"
  );
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
    if (data !== null) {
      return res.status(200).json({
        message: "This is Officer Delete Page",
        data: data,
      });
    } else {
      return res.status(400).json({ message: "Cannot find Officer" });
    }
  } catch (e) {
    return res.status(500).json({ message: "Cannot find Officer" });
  }
};

//Get Student Details
export const getDepartmentDetails = async (req: Request, res: Response) => {
  try {
    if (!req.params.id) {
      return res.status(400).json({ message: "Email not found" });
    }

    const data = await OfficerModel.find({ _id: req.params.id });
    const sendData = data[0].college_details;

    return res.status(200).json(sendData);
  } catch (err) {
    res.status(401).json({ message: err });
  }
};

// Add the Students details Department and batch wise
export const addDepartmentDetails = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const filter = { _id: req.params.id };
    const findDepartment = await OfficerModel.findById(filter);
    if (findDepartment?.college_details.length !== 0) {
      // Check if findDepartment or college_details is undefined
      const collegeDetails = findDepartment?.college_details ?? [];

      for (const department of collegeDetails) {
        if (
          department.department_name ===
            req.body.college_details.department_name &&
          department.year_batch === req.body.college_details.year_batch
        ) {
          return res.status(400).json({
            message: "Department Already exists in Officers details",
          });
        }
      }
    }

    const departmentName = req.body.department_name;
    const yearBatch = req.body.year_batch;
    req.body.college_details.student_details.map((e: Students, i: number) => {
      e.index = i + 1;
      e.branch = departmentName;
      e.year_batch = yearBatch;
    });

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
    const departmentDetailsId = req.body.department_id;
    let data = await findAndUpdate(
      filter,
      { $pull: { college_details: { _id: departmentDetailsId } } },
      { new: true }
    );
    if (data !== null) {
      return res.status(200).json({
        message: "This is Officer Delete Page",
        data: data,
      });
    } else {
      return res.status(400).json({ message: "Cannot find Officer" });
    }
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
    let studentExists = false; // Flag to check if student already exists

    for (const department of officer.college_details) {
      if (department.department_name === newStudentDetails.branch) {
        departmentFound = true;
        for (const student of department.student_details) {
          if (student.roll_no === newStudentDetails.roll_no) {
            studentExists = true;
            break; // Exit the loop once student is found
          }
        }
        if (studentExists) {
          break; // Exit the loop once student is found
        }
        newStudentDetails = {
          ...newStudentDetails,
          index:
            department.student_details[department.student_details.length - 1]
              .index + 1,
        };
        department.student_details.push(newStudentDetails);
      }
    }

    if (!departmentFound) {
      newStudentDetails = { ...newStudentDetails, index: 1 };
      const newDepartment: Department = {
        department_name: newStudentDetails.branch,
        year_batch: newStudentDetails.year_batch,
        student_details: [newStudentDetails],
      };
      officer.college_details.push(newDepartment);
    }

    // Save the updated officer document
    await officer.save();

    if (studentExists) {
      return res.status(400).json({
        message: "student details Already exists",
      });
    } else {
      return res.status(200).json({
        message: "One Student details added successfully",
        data: officer,
      });
    }
  } catch (err) {
    return res.status(500).json({
      message: "An Error Occurred while adding the student details",
      error: err,
    });
  }
};

// Delete One student data from the department in the student details
export const deleteOneStudentDetails = async (req: Request, res: Response) => {
  try {
    const officerId: string = req.params.id;
    const departmentName: string = req.body.branch;
    const departmentYearBatch: number = req.body.year_batch;
    const officer: Officer | null = await OfficerModel.findById(officerId);

    if (!officer) {
      return res.status(404).json({ error: "Officer not found" });
    }

    let departmentFound = false;
    let departmentIndex = -1;

    officer.college_details.forEach((department, index) => {
      if (
        department.department_name === departmentName &&
        department.year_batch === departmentYearBatch
      ) {
        departmentFound = true;
        departmentIndex = index;
      }
    });

    if (!departmentFound) {
      return res.status(404).json({ error: "Department not found" });
    }

    const department = officer.college_details[departmentIndex];

    if (req.body.index) {
      const studentIndex: number = parseInt(req.body.index); // Find the department by name

      // Find the student by index
      const studentIndexToDelete = department.student_details.findIndex(
        (student) => student.index === studentIndex
      );

      if (studentIndexToDelete === -1) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Remove the student from the department
      department.student_details.splice(studentIndexToDelete, 1);
    } else {
      const studentId: string = req.body.roll_no; // Find the department by name

      const studentIndexToDelete = department.student_details.findIndex(
        (student) => student.roll_no === studentId
      );

      if (studentIndexToDelete === -1) {
        return res.status(404).json({ error: "Student not found" });
      }

      // Remove the student from the department
      department.student_details.splice(studentIndexToDelete, 1);
    }

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

// Access the CSV file provided by frontend and convert it to the JSON format

export const convertStudentsCSVtoJSON = async (req: Request, res: Response) => {
  try {
    const officerId: string = req.params.id;
    const officer: Officer | null = await OfficerModel.findById(officerId);
    // Checking for the officer details in database
    if (!officer) {
      return res.status(404).json({ error: "Officer not found" });
    }
    // converting the csv file to JSON
    let newStudentDetails: Students[];

    // "promisify" function from the util module to convert the upload function into a promise
    const uploadPromise = promisify(upload);

    // await the completion of the upload operation using the uploadPromise variable.
    await uploadPromise(req, res);

    // if file does not exist
    if (!req.file) {
      return res.status(404).json({ error: "No file uploaded" });
    }

    // Check if the file exists and convert to json format.
    const csvFilePath = req.file.path;
    if (!csvFilePath) {
      return res.status(500).json({
        message: "CSV file uploaded not found",
      });
    }
    newStudentDetails = await csvtojson().fromFile(csvFilePath);

    // Delete the file that was stored by multer in our dir.
    deleteFolder(req.file.destination);

    // Check if data from csv file is set in newStudentDetails variable.
    if (!newStudentDetails) {
      return res.status(500).json({
        message: "CSV file cannot be converted not found",
      });
    }

    newStudentDetails.map((e, i) => {
      e.index = i + 1;
    });

    const newDepartment: Department = {
      department_name: req.body.department_name,
      year_batch: req.body.year_batch,
      student_details: newStudentDetails,
    };

    // push the new Department created
    officer.college_details.push(newDepartment);

    // Save the updated officer document
    await officer.save();

    return res.status(200).json({
      message: "CSV details added successfully",
      data: officer,
    });
  } catch (e) {
    return res.status(500).json({
      message:
        "An Error Occurred while Adding the student details with CSV file",
      error: e,
    });
  }
};
