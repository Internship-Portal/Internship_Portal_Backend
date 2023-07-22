import { Request, Response } from "express";
import validator from "validator";
import multer from "multer";
import csvtojson from "csvtojson";
import { promisify } from "util";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";

import OfficerModel, {
  Officer,
  Students,
  Department,
  subscribedCompany,
  selectedStudentsInterface,
} from "../models/officer";
import CompanyModel, {
  Company,
  batchwiseDepartmentsInterface,
  subscribedOfficer,
  subscribedOfficerSchema,
} from "../models/company";
import verificationModel from "../models/verification";
import { sendEmail } from "./otp";
import mongoose from "mongoose";
import connects from "../config/db";
import { MongoClient } from "mongodb";

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

// login Officer in the Backend Controller
export const loginOfficerController = async (req: Request, res: Response) => {
  try {
    if (!req.body.email_id) {
      //Error: Email not found
      return res.status(400).json({ message: "Email not found" });
    } else if (!req.body.password) {
      //Error: Password not found
      return res.status(400).json({ message: "Password not found" });
    } else {
      let { email_id, password }: { email_id: string; password: string } =
        req.body;
      email_id = email_id.trim();
      password = password.trim();

      // finding an officer in database
      const data = await OfficerModel.findOne({ email_id: email_id });
      if (data) {
        let foundOfficer = data;
        const hashedPassword = foundOfficer.password;
        // comparing the password.
        bcrypt.compare(password, hashedPassword).then(async (results) => {
          if (results) {
            // Converting the id and email
            const tokenToSave = jwt.sign(
              { data: data._id.toString() },
              SecretKey
            );

            return res.status(200).json({
              message: "Login Successful",
              data: data._id,
              token: tokenToSave,
            });

            // Creating the OTP for two step verification
            // const otp = Math.floor(100000 + Math.random() * 900000);

            // Create verification Model
            // const createdVerification = await verificationModel.create({
            //   user_token: tokenToSave,
            //   user: "officer",
            //   otp: otp,
            //   otpverified: false,
            //   expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            // });

            // Create JWT Token to send in the response
            // const token = jwt.sign({ id: createdVerification._id }, SecretKey, {
            //   expiresIn: "5m",
            // });

            // Send the OTP to the officer's email
            // Send Email
            // sendEmail(req, otp, foundOfficer.username, "validation")
            //   .then((response) => {
            //Success: Login Successful
            //   res.status(200).json({ message: response, token: token });
            // })
            // .catch((error) => res.status(500).json({ error: error.message }));
          } else {
            //Error: Wrong Password
            return res.status(404).json({ message: "Wrong Password Error" });
          }
        });
      } else {
        //Error: Officer does not exist
        return res.status(404).json({ message: "Officer does not exist" });
      }
    }
  } catch (e) {
    //Error: Server Problem
    return res.status(500).json({ message: "Server Error" });
  }
};

// verify Officer by Token got from frontend
// export const verifyOfficerTwoStepValidation = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const bearerHeader = req.headers.authorization;
//     const bearer: string = bearerHeader as string;
//     const tokenVerify = jwt.verify(
//       bearer.split(" ")[1],
//       SecretKey
//     ) as jwt.JwtPayload;
//     if (tokenVerify) {
//       // find the verification data
//       const verification = await verificationModel.findById({
//         _id: tokenVerify.id,
//       });
//       if (
//         verification &&
//         verification.otpverified === false &&
//         verification.user === "officer"
//       ) {
//         // take otp from frontend and
//         const { otp } = req.body;
//         if (Number(otp) === verification.otp) {
//           // Success: OTP verified
//           verification.otpverified = true;
//           await verification.save();

//           const tokenData = jwt.verify(
//             verification.user_token,
//             SecretKey
//           ) as jwt.JwtPayload;

//           return res.status(200).json({
//             message: "OTP verified",
//             data: tokenData,
//             token: verification.user_token,
//           });
//         } else {
//           // Error: Invalid OTP
//           return res.status(400).json({ message: "Invalid OTP" });
//         }
//       } else {
//         // Error: Problem in verifying
//         return res.status(500).json({ message: "Invalid Token" });
//       }
//     } else {
//       //Error: cannot verify token
//       res.status(400).json({ message: "Cannot verify token" });
//     }
//   } catch (e) {
//     //Error: Problem in verifying
//     return res.status(500).json({ message: "Problem in verifying the token" });
//   }
// };

// verify Officer by Token got from frontend
export const verifyOfficerByToken = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      //Success: data: with id and email_id
      return res.status(200).send({
        message: "Login by token Successful",
        data: tokenVerify.data,
      });
    } else {
      //Error: cannot verify token
      res.status(400).json({ message: "Cannot verify token" });
    }
  } catch (e) {
    //Error: Problem in verifying
    return res.status(500).json({ message: "Problem in verifying the token" });
  }
};

// Create Officer in the Backend Controller
export const createOfficerController = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
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

      let email_id = tokenVerify.email_id.toLowerCase();

      if (!username || !email_id || !mobile_no || !password || !college_name) {
        //Error: anyone details not available
        return res.status(400).json({ message: "Data Incomplete Error" });
      } else if (!validator.isEmail(email_id)) {
        //Error: Invalid Email id passed
        return res.status(400).json({ message: "Invalid Email" });
      } else if (password.length < 8) {
        //Error: password less than 8 characters
        return res
          .status(400)
          .json({ message: "password less than 8 characters" });
      } else if (mobile_no.length < 5) {
        //Error: mobile_no greater than 5 characters
        return res
          .status(400)
          .json({ message: "mobile_no greater than 5 characters" });
      } else {
        // checking if the Officer already exists in database
        email_id = email_id.trim();
        password = password.trim();
        const company = await CompanyModel.findOne({ email_id: email_id });
        const officer = await OfficerModel.findOne({ email_id: email_id });
        if (officer || company) {
          //Error: If the data already exist
          return res.status(400).json({
            message: "Officer or Company already Exists with this email id",
          });
        } else {
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
              OfficerModel.create({
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
                //Success: then returning the Officer Id of the Officer.
                return res.status(200).json({
                  message: "Officer Created Page Successfully",
                });
              });
            })
            .catch((e) => {
              //Error: Problem in bcrypt (Hashing)
              return res
                .status(500)
                .json({ message: "error while hashing the password" });
            });
        }
      }
    } else {
      // Error:
      res.status(400).json({ message: "Cannot verify token" });
    }
  } catch (error: any) {
    //Error: If anything creates problem
    return res.status(500).json({ message: "Server Error" });
  }
};

// Find Get One Officer by Id Controller
export const findOfficerController = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const officerId = await OfficerModel.exists({ _id: tokenVerify.data });
      // finding the officer by the ID got from the frontend
      if (!officerId) {
        let data = await OfficerModel.findById({
          _id: tokenVerify.data,
        }).select(" -password");

        // checking if the officer exists or not
        if (!data) {
          //Error: Officer does not exist
          return res.status(404).json({ message: "Officer not found" });
        } else {
          // Success: pass the data
          return res.status(200).json({
            message: "This is Officer findone Page",
            data: data,
          });
        }
      } else {
        // Error: Problem in verifying
        return res.status(500).json({ message: "valid Officer not found." });
      }
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

// Get All Officer Controller
export const getAllOfficerController = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    // verifying the token
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const officerId = await OfficerModel.exists({ _id: tokenVerify.data });
      // finding the officer by the ID got from the frontend
      if (!officerId) {
        // Collecing all officers and sending by removing some fields
        let data = await OfficerModel.find().select(
          "-password -college_details -subscribe_request_from_company -subscribed_company -cancelled_company -subscribe_request_to_company"
        );
        if (data.length !== 0) {
          // Success: Data Found and send successfully
          return res.json({
            message: "This is Officer getAll page",
            data: data,
          });
        } else {
          // Error: Problem in verifying
          return res.status(500).json({ message: "valid Officer not found." });
        }
      } else {
        // Error: data not found
        return res.status(500).json({ message: "Officers not found" });
      }
    } else {
      // Error: verifying the token
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // Error: Server Error
    return res.status(500).json({ message: "Server Error" });
  }
};

// Delete Officer by Id Controller
export const deleteOfficerController = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // check for the data and delete
      let data = await OfficerModel.findByIdAndDelete({
        _id: tokenVerify.data,
      });
      if (data !== null) {
        // Success: Data Found
        return res.status(200).json({
          message: "This is Officer Delete Page",
          data: data,
        });
      } else {
        // Error: officer not deleted
        return res.status(400).json({ message: "Cannot find Officer" });
      }
    } else {
      // Error: problem in token
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // Error: Overall Error
    return res.status(500).json({ message: "Cannot find Officer" });
  }
};

//Get Student Details
export const getDepartmentDetails = async (req: Request, res: Response) => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // Searching for the id passed in params
      const data = await OfficerModel.findById({ _id: tokenVerify.data });
      if (!data) {
        // Error: officer not found
        return res.status(404).json({ message: "Officer not found" });
      } else {
        const sendData = data.college_details;

        // Success: details
        return res
          .status(200)
          .json({ message: "This is getDepartmentDetails", data: sendData });
      }
    } else {
      // Error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (err) {
    // Error:
    return res
      .status(401)
      .json({ message: "Error occured in get Department details" });
  }
};

// Add the Students details Department and batch wise
export const addDepartmentDetails = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // Find the officer by id
      const filter = { _id: tokenVerify.data };
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
            // Error:
            return res.status(400).json({
              message: "Department Already exists in Officers details",
            });
          }
        }
      }

      const departmentName: string = req.body.department_name;
      const yearBatch: number = req.body.year_batch;
      req.body.college_details.student_details.map((e: Students, i: number) => {
        e.index = i + 1;
        e.branch = departmentName;
        e.year_batch = yearBatch;
      });

      let data = await OfficerModel.findOneAndUpdate(
        filter,
        { $push: { college_details: req.body.college_details } },
        { new: true }
      );
      // Success: Add the Department Details page
      return res.status(200).json({
        message: "This is Officer addDepartmentDetails page",
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

// Remove the Student details Department and batch wise
export const removeDepartmentDetails = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    // Verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;

    if (tokenVerify) {
      // Find and delete the department by its id
      const departmentDetailsId = req.body.department_id;
      const officer = await OfficerModel.findById(tokenVerify.data);

      if (!officer) {
        // Officer not found
        return res.status(404).json({ message: "Officer not found" });
      }

      const departmentIndex = officer.college_details.findIndex(
        (e: Department) => e._id == departmentDetailsId
      );

      if (departmentIndex !== -1) {
        // Remove the department from officer's college_details
        officer.college_details.splice(departmentIndex, 1);

        // Save the updated officer
        const savedOfficer = await officer.save();

        if (savedOfficer) {
          // Success: Department removed
          return res.status(200).json({
            message: "Department removed successfully",
          });
        } else {
          // Error: Failed to save the officer
          return res
            .status(500)
            .json({ message: "Failed to save the officer" });
        }
      } else {
        // Error: Department not found in officer's college_details
        return res.status(400).json({ message: "Department not found" });
      }
    } else {
      // Error: Problem in verifying the token
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // Error: Server Error
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addOneStudentDetails = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      let newStudentDetails: Students = req.body;

      // Find Officer
      const officer: Officer | null = await OfficerModel.findById({
        _id: tokenVerify.data,
      });

      if (!officer) {
        // Error:
        return res.status(404).json({ error: "Officer not found" });
      } else {
        let departmentFound = false;
        let studentExists = false; // Flag to check if student already exists

        for (const department of officer.college_details) {
          if (
            department.department_name === newStudentDetails.branch &&
            department.year_batch == newStudentDetails.year_batch
          ) {
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
                department.student_details[
                  department.student_details.length - 1
                ].index + 1,
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
          // Error:
          return res.status(400).json({
            message: "student details Already exists",
          });
        } else {
          // Success:
          return res.status(200).json({
            message: "One Student details added successfully",
          });
        }
      }
    } else {
      // Error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (err) {
    // Error:
    return res.status(500).json({
      message: "An Error Occurred while adding the student details",
      error: err,
    });
  }
};

// Delete One student data from the department in the student details
export const deleteOneStudentDetails = async (req: Request, res: Response) => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // Find the officer
      const departmentName: string = req.body.branch;
      const departmentYearBatch: number = req.body.year_batch;
      const officer: Officer | null = await OfficerModel.findById({
        _id: tokenVerify.data,
      });

      if (!officer) {
        // Error:
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
        // Error:
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
          // Error:
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
          // Error:
          return res.status(404).json({ error: "Student not found" });
        }

        // Remove the student from the department
        department.student_details.splice(studentIndexToDelete, 1);
      }

      // Save the updated officer document
      await officer.save();
      // Success
      return res.json({
        message: "One student details deleted successfully",
      });
    } else {
      // Error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // Error:
    return res.status(500).json({
      message: "An Error Occured while removing the student details",
      error: e,
    });
  }
};

const createStudentsIndexing = async (
  officer: Officer,
  department: string,
  year_batch: number
): Promise<void> => {
  try {
    const client = new MongoClient(
      "mongodb+srv://admin:admin@imdb.11npizj.mongodb.net"
    );
    await client.connect();

    const db = client.db("Internship_Portal"); // Replace 'yourDatabaseName' with your actual database name
    const officerCollection = db.collection("officers"); // Replace 'officers' with the name of your collection

    // Extract the college_details index where department_name matches
    const collegeDetailsIndex = officer.college_details.findIndex(
      (details: any) =>
        details.department_name === department &&
        details.year_batch === year_batch
    );

    // Access the college_details subdocument and create the index for student_details field
    await officerCollection.createIndex(
      {
        [`college_details.${collegeDetailsIndex}.student_details.achievements`]: 1,
        [`college_details.${collegeDetailsIndex}.student_details.skills`]: 1,
      },
      { background: true } // Optional: You can specify additional index options
    );

    await client.close();
  } catch (error) {
    console.error("Error creating index:", error);
  }
};

// Access the CSV file provided by frontend and convert it to the JSON format

export const convertStudentsCSVtoJSON = async (req: Request, res: Response) => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const officer: Officer | null = await OfficerModel.findById({
        _id: tokenVerify.data,
      });
      let departmentFound = false;

      // Checking for the officer details in database
      // converting the csv file to JSON
      let newStudentDetails;

      // "promisify" function from the util module to convert the upload function into a promise
      const uploadPromise = promisify(upload);

      // await the completion of the upload operation using the uploadPromise variable.
      await uploadPromise(req, res);

      if (!officer) {
        return res.status(404).json({ error: "Officer not found" });
      } else {
        // if file does not exist
        if (!req.file) {
          // Error:
          return res.status(404).json({ error: "No file uploaded" });
        } else {
          for (const department of officer.college_details) {
            if (
              department.department_name === req.body.department_name &&
              department.year_batch == req.body.year_batch
            ) {
              departmentFound = true;
            }
          }
          if (departmentFound) {
            // Error:
            return res
              .status(400)
              .json({ error: "Department already exists in Officer" });
          } else {
            // Check if the file exists and convert to json format.
            const csvFilePath = req.file.path;
            if (!csvFilePath) {
              // Error:
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
              if (
                e.internship_start_date !== null &&
                e.internship_end_date !== null &&
                e.internship_start_date.length !== 0 &&
                e.internship_end_date.length !== 0
              ) {
                e.internship_start_date = new Date(e.internship_start_date);
                e.internship_end_date = new Date(e.internship_end_date);
              }
            });

            // if departmentname and year batch exists or not
            if (!req.body.department_name || !req.body.year_batch) {
              // Error:
              return res.status(400).json({ error: "Data not uploaded" });
            }

            const newDepartment: Department = {
              department_name: req.body.department_name,
              year_batch: req.body.year_batch,
              student_details: [...newStudentDetails],
            };

            // push the new Department created
            officer.college_details.push(newDepartment);

            // Save the updated officer document
            await officer.save();

            createStudentsIndexing(
              officer,
              req.body.department_name,
              req.body.year_batch
            );

            // Success:
            return res.status(200).json({
              message: "CSV details added successfully",
            });
          }
        }
      }
    } else {
      // Error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // Error:
    return res.status(500).json({
      message:
        "An Error Occurred while Adding the student details with CSV file",
      error: e,
    });
  }
};

export const getStudentDetailsbyDeptAndYear = async (
  req: Request,
  res: Response
) => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      let { department_name, year_batch } = req.body;
      let id = tokenVerify.data;
      if (!department_name || !year_batch || !id) {
        // Error:
        return res.status(400).json({ error: "Incomplete Data" });
      }

      const data = await OfficerModel.findById({ _id: id });
      if (!data) {
        // Error:
        return res.status(400).json({ error: "Officer not found" });
      } else {
        // bool for data bot found
        let sendData = false;
        data.college_details.map((e) => {
          if (
            e.department_name === department_name &&
            e.year_batch == year_batch
          ) {
            //Success: if we both the department and year_batch
            sendData = true;

            return res.status(200).json({
              message: "This is get Students details by dept and year API",
              data: e,
            });
          }
        });
        // if the department does not exist in officer details.
        if (!sendData) {
          // Error:
          return res
            .status(400)
            .json({ message: "Department not exist in officer details." });
        }
      }
    } else {
      // Error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // Error:
    res
      .status(401)
      .json({ message: "Error occured while getting the student details" });
  }
};

export const getStudentDetailsbyDeptAndYearSeparatedAvaiability = async (
  req: Request,
  res: Response
) => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      let { department_name, year_batch } = req.body;
      let id = tokenVerify.data;
      if (!department_name || !year_batch || !id) {
        // Error:
        return res.status(400).json({ error: "Incomplete Data" });
      }

      const data = await OfficerModel.findById({ _id: id });
      if (!data) {
        // Error:
        return res.status(400).json({ error: "Officer not found" });
      } else {
        // bool for data bot found
        let Departmant: Department | undefined = undefined;
        Departmant = data.college_details.find(
          (e) =>
            e.department_name === department_name && e.year_batch == year_batch
        );
        // if the department does not exist in officer details.
        if (!Departmant) {
          // Error:
          return res
            .status(400)
            .json({ message: "Department not exist in officer details." });
        } else {
          let availableStudents: Students[] = [];
          let unavailableStudents: Students[] = [];
          Departmant.student_details.map((e: Students) => {
            if (e.Internship_status === false) {
              // if the student is not available
              unavailableStudents.push(e);
            } else {
              // if the student is available
              availableStudents.push(e);
            }
          });
          //Success: if we both the department and year_batch
          return res.status(200).json({
            message: "This is get Students details by dept and year API",
            data: {
              availableStudents: availableStudents,
              unavailableStudents: unavailableStudents,
            },
          });
        }
      }
    } else {
      // Error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (e) {
    // Error:
    res
      .status(401)
      .json({ message: "Error occurred while getting the student details" });
  }
};

// Add subscribe request to Company
export const addSubscribeRequestToCompany = async (
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
      const { _id, message } = req.body;
      if (!_id || !message) {
        // Error:
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        // Find Officer and Company in both
        const officerData = await OfficerModel.findById({
          _id: tokenVerify.data,
        });
        const companydata = await CompanyModel.findById({ _id: _id });
        if (companydata && officerData) {
          // check if the company is already requested subscription or not

          const foundInRequestToCompany =
            officerData.subscribe_request_to_company.some(
              (e) => e.company_id === _id
            );

          const foundInRequestFromCompany =
            officerData.subscribe_request_from_company.some(
              (e) => e.company_id === _id
            );

          const foundInSubscribedCompanies =
            officerData.subscribed_company.some((e) => e.company_id === _id);

          if (
            foundInRequestToCompany === false &&
            foundInRequestFromCompany === false &&
            foundInSubscribedCompanies === false
          ) {
            const dataCompany = {
              officer_id: officerData._id,
              index: officerData.index,
              message: message,
              college_name: officerData.college_name,
              username: officerData.username,
            };
            const dataOfficer = {
              company_id: companydata._id,
              index: companydata.index,
              message: message,
              username: companydata.username,
              company_name: companydata.company_name,
            };

            // push the data in company in subscribe_request_from_officer
            companydata.subscribe_request_from_officer.push(dataCompany);

            // push the data in officer in subscribe_request_to_company
            officerData.subscribe_request_to_company.push(dataOfficer);

            // save
            const savedCompany = await companydata.save();
            const savedOfficer = await officerData.save();

            if (savedCompany && savedOfficer) {
              // successfully saved the data
              return res.status(200).json({ message: "Request Sent" });
            } else {
              // Error:
              return res
                .status(400)
                .json({ message: "Request cannot be sent" });
            }
          } else {
            // Error:
            return res.status(400).json({
              message:
                "Already requested to subscribe or already subscribed the company",
            });
          }
        } else {
          // Error:
          return res
            .status(400)
            .json({ message: "Company or officer does not exist" });
        }
      }
    } else {
      // Error:
      return res.status(400).json({ message: "Token not found" });
    }
  } catch (e) {
    // Error:
    return res.status(500).json({ message: "Server Error" });
  }
};

// cancle the request of companies by companies and add that data in both officer and company cancelled schema
export const addCancelledRequest = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // Find the data in company
      const { company_id, message } = req.body;
      const company = await CompanyModel.findById({ _id: company_id });
      if (company) {
        const officer = await OfficerModel.findById({ _id: tokenVerify.data });
        if (officer) {
          let found_in_Officer = false,
            found_in_Company = false;
          // remove the requested data from officer
          officer.subscribe_request_from_company =
            officer.subscribe_request_from_company.filter((obj) => {
              if (obj.company_id === company_id) {
                found_in_Officer = true;
              }
              return obj.company_id !== company_id;
            });

          // remove the requested data from company
          company.subscribe_request_to_officer =
            company.subscribe_request_to_officer.filter((obj) => {
              if (obj.officer_id === tokenVerify.data) {
                found_in_Company = true;
              }
              return obj.officer_id !== tokenVerify.data;
            });

          if (!found_in_Company || !found_in_Officer) {
            return res.status(400).json({ message: "Invalid Request" });
          }

          // add cancelled requested data to the officer
          const cancelOfficer = {
            company_id: company_id,
            index: company.index,
            message: message,
            username: company.username,
            company_name: company.company_name,
            cancelled_by: "officer",
          };
          officer.cancelled_company.push(cancelOfficer);

          // add cancelled requested data to the company
          const cancelCompany = {
            officer_id: tokenVerify.data,
            index: officer.index,
            message: message,
            college_name: officer.college_name,
            username: officer.username,
            cancelled_by: "officer",
          };
          company.cancelled_officer.push(cancelCompany);

          // save
          const savedCompany = await company.save();
          const savedOfficer = await officer.save();

          if (savedCompany && savedOfficer) {
            // Success :
            return res.status(200).json({
              message: "Cancelled the company request",
            });
          } else {
            // Error:
            return res.status(500).json({ message: "Cannot cancel request" });
          }
        } else {
          // Error:
          return res.status(404).json({ message: "Officer not found" });
        }
      } else {
        // Error:
        return res.status(400).json({ message: "Company not found" });
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

// Cancle Request made by officer
export const addCancelledRequestByOfficer = async (
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

    if (!tokenVerify) {
      // Error: Problem in verifying the token
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }

    const { company_id, message, selectedstudents } = req.body;

    if (!company_id || !message) {
      // Error: Incomplete Data
      return res.status(400).json({ message: "Incomplete Data" });
    }

    const officer = await OfficerModel.findById({ _id: tokenVerify.data });

    if (!officer) {
      // Error: Officer not found
      return res.status(400).json({ message: "Officer not found" });
    }

    // Find the company
    const company = await CompanyModel.findById({ _id: company_id });

    if (!company) {
      // Error: Company not found
      return res.status(400).json({ message: "Company not found" });
    } else {
      let found_in_Officer = false;
      let found_in_Company = false;
      // Remove the requested data from officer
      officer.subscribe_request_to_company =
        officer.subscribe_request_to_company.filter((obj) => {
          if (obj.company_id === company_id) {
            found_in_Officer = true;
          }
          return obj.company_id !== company_id;
        });

      // Remove the requested data from company
      company.subscribe_request_from_officer =
        company.subscribe_request_from_officer.filter((obj) => {
          if (obj.officer_id === tokenVerify.data) {
            found_in_Company = true;
          }
          return obj.officer_id !== tokenVerify.data;
        });

      if (!found_in_Company || !found_in_Officer) {
        return res.status(400).json({ message: "Invalid Request" });
      }

      // Add cancelled requested data to the officer
      const cancelOfficer = {
        company_id: company._id,
        index: company.index,
        message: message,
        username: company.username,
        company_name: company.company_name,
        cancelled_by: "officer",
      };
      officer.cancelled_company.push(cancelOfficer);

      // Add cancelled requested data to the company
      const cancelCompany = {
        officer_id: officer._id,
        index: officer.index,
        message: message,
        college_name: officer.college_name,
        username: officer.username,
        cancelled_by: "officer",
      };
      company.cancelled_officer.push(cancelCompany);

      console.log(officer.cancelled_company, company.cancelled_officer);

      // Save changes
      await officer.save();
      await company.save();

      // Success: Cancelled the company request
      return res.status(200).json({
        message: "Cancelled the company request",
      });
    }
  } catch (e) {
    // Error: Server Error
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addSubscribedOfficerFromOfficer = async (
  req: Request,
  res: Response
) => {
  // try {
  const bearerHeader = req.headers.authorization;
  const bearer: string = bearerHeader as string;
  const tokenVerify = jwt.verify(
    bearer.split(" ")[1],
    SecretKey
  ) as jwt.JwtPayload;
  if (tokenVerify) {
    // Find the Company
    const { company_id, message, selected_students } = req.body;
    // check the data came from frontend or not
    if (!company_id || !message) {
      // Error:
      return res.status(400).json({ message: "Incomplete Data" });
    } else {
      const company = await CompanyModel.findById({
        _id: company_id,
      });
      if (company) {
        const officer = await OfficerModel.findById({
          _id: tokenVerify.data,
        });
        if (officer) {
          // Check if the subscriber already exists

          const foundInSubscribedCompanies = officer.subscribed_company.some(
            (e) => e.company_id === company_id
          );

          if (foundInSubscribedCompanies === false) {
            // remove from the request send by officer
            officer.subscribe_request_from_company =
              officer.subscribe_request_from_company.filter(
                (obj) => obj.company_id !== company_id.toString()
              );

            // remove from the officer from which the request has come
            company.subscribe_request_to_officer =
              company.subscribe_request_to_officer.filter(
                (obj) => obj.officer_id !== tokenVerify.data.toString()
              );

            // add to the subscribedOfficer schema of company
            const companyData = {
              officer_id: tokenVerify.data,
              index: officer.index,
              selectedbycompany: [],
              college_name: officer.college_name,
              username: officer.username,
              message: message,
              selectedbyOfficer: selected_students,
            };

            company.subscribed_officer.push(companyData);

            // add to the officer that requested to company
            const officerData = {
              company_id: company._id,
              index: company.index,
              selectedbycompany: [],
              username: company.username,
              company_name: company.company_name,
              message: message,
              selectedbyOfficer: selected_students,
            };

            officer.subscribed_company.push(officerData);

            // save
            const savedCompany = await company.save();
            const savedOfficer = await officer.save();

            if (savedOfficer && savedCompany) {
              // Success :
              return res
                .status(200)
                .json({ message: "Successfully subscribed to the company" });
            } else {
              // Error:
              return res
                .status(500)
                .json({ message: "Failed to subscribe to the company" });
            }
          }
        } else {
          // Error:
          return res.status(404).json({ message: "Officer not found" });
        }
      } else {
        // Error:
        return res.status(400).json({ message: "Company not found" });
      }
    }
  } else {
    // Error:
    return res.status(500).json({ message: "Problem in verifying the token" });
  }
  // } catch (e) {
  //   // Error:
  //   return res.status(500).json({ message: "Server Error" });
  // }
};

// export const giveAccessToCompanies = async (req: Request, res: Response) => {
//   try {
//     const bearerHeader = req.headers.authorization;
//     const bearer: string = bearerHeader as string;
//     const tokenVerify = jwt.verify(
//       bearer.split(" ")[1],
//       SecretKey
//     ) as jwt.JwtPayload;
//     if (tokenVerify) {
//       const officer_id = tokenVerify.data;
//       const { company_id, access } = req.body;
//       if (!company_id || !access) {
//         // Error:
//         return res.status(400).json({ message: "Incomplete Data" });
//       } else {
//         // find both the officer and company
//         const foundOfficer = await OfficerModel.findById({ _id: officer_id });
//         const foundCompany = await CompanyModel.findById({ _id: company_id });

//         // if officer or company is not found
//         if (!foundOfficer || !foundCompany) {
//           // Error:
//           return res
//             .status(400)
//             .json({ message: "given Officer or Company not found" });
//         } else {
//           // change the access details in both officer and company side

//           // save
//           const savedCompany = await foundCompany.save();
//           const savedOfficer = await foundOfficer.save();

//           // success: Access is given successfully
//           return res.status(200).json({
//             message: "Access is given successfully",
//           });
//         }
//       }
//     } else {
//       // Error:
//       return res
//         .status(500)
//         .json({ message: "Problem in verifying the token" });
//     }
//   } catch (e) {
//     // Error:
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

export const getAllRequestedCompanies = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const foundOfficer = await OfficerModel.findById({
        _id: tokenVerify.data,
      });

      if (!foundOfficer) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const allRequestedCompanies =
          foundOfficer.subscribe_request_from_company;

        if (allRequestedCompanies.length === 0) {
          // No Requested Companies
          return res.status(200).json({ message: "Not any Request" });
        } else {
          // Success:
          return res.status(200).json({
            message: "get All Requested Companies Successful",
            data: allRequestedCompanies,
          });
        }
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

export const getAllRequestsbyOfficer = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const foundOfficer = await OfficerModel.findById({
        _id: tokenVerify.data,
      });

      if (!foundOfficer) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const allRequestedbyOfficer = foundOfficer.subscribe_request_to_company;

        if (allRequestedbyOfficer.length === 0) {
          // No Requested Companies
          return res.status(200).json({ message: "Not any Request" });
        } else {
          // Success:
          return res.status(200).json({
            message: "get All Requested Companies Successful",
            data: allRequestedbyOfficer,
          });
        }
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

export const getAllSubscribedCompanies = async (
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
      const foundOfficer = await OfficerModel.findById({
        _id: tokenVerify.data,
      });

      if (!foundOfficer) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const subscribedcompanies = foundOfficer.subscribed_company;

        if (subscribedcompanies.length === 0) {
          // No Requested Companies
          return res.status(200).json({ message: "Not any Request" });
        } else {
          // Success:
          return res.status(200).json({
            message: "get All Requested Companies Successful",
            data: subscribedcompanies,
          });
        }
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

export const getAllCancelledRequests = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const foundOfficer = await OfficerModel.findById({
        _id: tokenVerify.data,
      });

      if (!foundOfficer) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const allCancelledCompanies = foundOfficer.cancelled_company;

        if (allCancelledCompanies.length === 0) {
          // No Requested Companies
          return res
            .status(200)
            .json({ message: "Not any cancelled Requests" });
        } else {
          // Success:
          return res.status(200).json({
            message: "get All Requested Companies Successful",
            data: allCancelledCompanies,
          });
        }
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

export const getAllCompanyByFilter = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const companies = await CompanyModel.find({})
        .select(
          "-password -cancelled_officer -subscribe_request_from_officer -subscribe_request_to_officer -subscribed_officer "
        )
        .exec();

      // Assuming you have retrieved the company data
      const officerData = await OfficerModel.findById({
        _id: tokenVerify.data,
      })
        .populate("subscribe_request_from_company")
        .populate("subscribe_request_to_company")
        .populate("subscribed_company")
        .exec();

      if (!officerData) {
        return res.status(404).json({ message: "Company data not found." });
      }

      // Remove officers present in company data
      const filteredCompanies = companies.filter((company) => {
        const companyId = company._id.toString();
        const isSubscribeRequestFromCompanies =
          officerData.subscribe_request_from_company.some(
            (req) => req.company_id.toString() === companyId
          );
        const isSubscribeRequestToCompanies =
          officerData.subscribe_request_to_company.some(
            (req) => req.company_id.toString() === companyId
          );
        const isSubscribedCompanies = officerData.subscribed_company.some(
          (sub) => sub.company_id.toString() === companyId
        );

        return !(
          isSubscribeRequestFromCompanies ||
          isSubscribeRequestToCompanies ||
          isSubscribedCompanies
        );
      });

      // Shuffle the officers array randomly

      // Define the chunk size and total number of chunks
      const chunkSize = 7; // Number of items in each chunk
      const totalChunks = Math.ceil(filteredCompanies.length / chunkSize);

      // Get the requested chunk number from the query parameter
      const requestedChunk = parseInt(req.query.chunk as string) || 1;

      // Calculate the start and end indices of the chunk
      const startIndex = (requestedChunk - 1) * chunkSize;
      const endIndex = requestedChunk * chunkSize;

      // Slice the shuffled data array to get the desired chunk
      const chunkData = filteredCompanies.slice(startIndex, endIndex);

      //Success: Send the chunk data as a response
      return res.status(200).json({
        message: "Get All Filtered officers is successful",
        totalChunks: totalChunks,
        chunkData: chunkData,
      });
    } else {
      // Error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (error) {
    return res.status(500).json("Error retrieving officers: " + error);
  }
};

export const getAllCompaniesByFilterInChunksWithSearch = async (
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
      const { search }: { search: string } = req.body;

      if (!search || search.length < 3) {
        // Error: Incomplete Data
        return res.status(400).json({ message: "Give atleast 3 letters" });
      }

      const Companies = await CompanyModel.find({})
        .select(
          "-password -cancelled_officer -subscribe_request_from_officer -subscribe_request_to_officer -subscribed_officer"
        )
        .exec();

      // Assuming you have retrieved the company data
      const officerData = await OfficerModel.findById({
        _id: tokenVerify.data,
      });

      if (!officerData) {
        return res.status(404).json({ message: "Company data not found." });
      } else {
        // Filter Companies based on search criteria
        const filteredCompanies = Companies.filter((Company) => {
          const { username, email_id, mobile_no, company_name } = Company;
          const lowerSearch = search.toLowerCase().replace(" ", "");

          // Check if any of the Companies's fields match the search query
          return (
            username.toLowerCase().replace(" ", "").includes(lowerSearch) ||
            email_id.toLowerCase().replace(" ", "").includes(lowerSearch) ||
            mobile_no.toLowerCase().replace(" ", "").includes(lowerSearch) ||
            company_name.toLowerCase().replace(" ", "").includes(lowerSearch)
          );
        });

        // Data Interface
        interface Data {
          subscribe_request_from_company: Company[];
          subscribe_request_to_company: Company[];
          subscribed_company: Company[];
          remaining_company: Company[];
        }

        // Initialize data object
        const data: Data = {
          subscribe_request_from_company: [],
          subscribe_request_to_company: [],
          subscribed_company: [],
          remaining_company: [],
        };

        // Filter Companies and populate data object
        filteredCompanies.forEach((company) => {
          const companyId = company._id.toString();

          if (
            officerData.subscribe_request_from_company.some(
              (req) => req.company_id.toString() === companyId
            )
          ) {
            data.subscribe_request_from_company.push(company);
            return; // Proceed to next iteration
          }

          if (
            officerData.subscribe_request_to_company.some(
              (req) => req.company_id.toString() === companyId
            )
          ) {
            data.subscribe_request_to_company.push(company);
            return; // Proceed to next iteration
          }

          if (
            officerData.subscribed_company.some(
              (sub) => sub.company_id.toString() === companyId
            )
          ) {
            data.subscribed_company.push(company);
            return; // Proceed to next iteration
          }

          data.remaining_company.push(company);
        });

        return res.status(200).json({
          message: "Get All Filtered Companies is successful",
          data: data,
        });
      }
    }
  } catch (error) {
    // Error:
    return res.status(500).json("Error retrieving Companies: " + error);
  }
};

export const sendEmailForConfirmedStudents = (
  Officer: Officer,
  Company: Company,
  department_name: string,
  year_batch: number,
  start_date: Date | null,
  end_date: Date | null,
  selected_students: any[]
) => {
  return new Promise((resolve, reject) => {
    // configure the nodemailer
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "teamgenshinofficial@gmail.com",
        pass: "wkrivbrwloojnpzb",
      },
    });

    var documentHTML = selected_students
      .map((student) => {
        const { name, roll_no } = student;
        return `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #00466a; margin-bottom: 5px;">Name: ${name}</h3>
            <p style="margin: 0; font-size: 0.9em;">Roll No: ${roll_no}</p>
          </div>
        `;
      })
      .join("");

    let mail_configs;

    mail_configs = {
      from: "teamgenshinofficial@gmail.com",
      to: [Officer.email_id, Company.email_id],
      subject: `Internship Portal - Students Selected by ${Company.company_name}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Internship Portal - Students Selected Email</title>
</head>
<body>
<div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2;">
  <div style="margin: 50px auto; width: 70%; padding: 20px 0;">
    <div style="border-bottom: 1px solid #eee;">
      <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600;">Internship Portal</a>
    </div>
    <p style="font-size: 1.1em;">Hi users,</p>
    <p>${Officer.college_name}, which is handled by ${Officer.username}, has confirmed the students from the Department of ${department_name}, batch ${year_batch}, from the list sent by Company representative ${Company.username} from ${Company.company_name}.</p>
    <p>The Department Details are listed out with respect to the Year-Batch below. Check it out.</p>
    ${documentHTML}
    <p style="font-size: 0.9em;">Regards,<br />Internship Portal</p>
    <hr style="border: none; border-top: 1px solid #eee;" />
    <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300;">
      <p>Internship Portal Inc</p>
      <p>Pimpri Chinchwad</p>
      <p>Pune</p>
    </div>
  </div>
</div>
</body>
</html>`,
    };

    if (end_date && start_date) {
      mail_configs = {
        from: "teamgenshinofficial@gmail.com",
        to: [Officer.email_id, Company.email_id],
        subject: `Internship Portal - Students Selected by ${Company.company_name}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Internship Portal - Students Selected Email</title>
</head>
<body>
<div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2;">
  <div style="margin: 50px auto; width: 70%; padding: 20px 0;">
    <div style="border-bottom: 1px solid #eee;">
      <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600;">Internship Portal</a>
    </div>
    <p style="font-size: 1.1em;">Hi users,</p>
    <p>${Officer.college_name}, which is handled by ${
          Officer.username
        }, has confirmed the students of the Department ${department_name}, batch ${year_batch}, from ${start_date
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "/")} to ${end_date
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "/")} from the list sent by Company representative ${
          Company.username
        }.</p>
    <p>The Department Details are listed out with respect to the Year-Batch below. Check it out.</p>
    ${documentHTML}
    <p style="font-size: 0.9em;">Regards,<br />Internship Portal</p>
    <hr style="border: none; border-top: 1px solid #eee;" />
    <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300;">
      <p>Internship Portal Inc</p>
      <p>Pimpri Chinchwad</p>
      <p>Pune</p>
    </div>
  </div>
</div>
</body>
</html>`,
      };
    }

    // Send the mail to the gmails.
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        // Error: error found
        return reject({ message: `An error has occurred`, error: error });
      }
      // Success: Email Sent
      return resolve({ message: "Email sent successfully" });
    });
  });
};

// confirm the selected students department wise and batch-year wise to be unavailable with respect to the Date Provided
export const confirmSelectedStudentsWithDates = async (
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
      // get the data from frontend
      const { company_id, company_name, selectedstudents } = req.body;
      if (!company_id || !selectedstudents) {
        // Error: Data not found
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        // find the Officer
        const Officer = await OfficerModel.findById({ _id: tokenVerify.data });
        const Company = await CompanyModel.findById({ _id: company_id });
        if (!Officer || !Company) {
          return res
            .status(404)
            .json({ message: "Officer or Company not found" });
        } else {
          // take out the data from selectedstudents
          selectedstudents.map((e: any, i: number) => {
            const {
              department_name,
              start_date,
              end_date,
              year_batch,
            }: {
              department_name: string;
              start_date: Date;
              end_date: Date;
              year_batch: number;
            } = selectedstudents[i];

            console.log(department_name, start_date, end_date, year_batch);

            let foundElement: Department | null = null;
            // find the department and year_batch in officer
            for (let i = 0; i < Officer.college_details.length; i++) {
              if (
                Officer.college_details[i].department_name ===
                  department_name &&
                Officer.college_details[i].year_batch === year_batch
              ) {
                foundElement = Officer.college_details[i];
                break;
              }
            }

            if (foundElement === null) {
              // Error: Department not found
              return res.status(404).json({
                message: `Department ${department_name} with batch year ${year_batch} not found`,
              });
            } else {
              // find the student in the foundElement

              const students = selectedstudents[i].student_details;
              for (let i = 0; i < students.length; i++) {
                // check if the student is already selected for any internship or not boolean

                const studentDetails = foundElement?.student_details;
                if (studentDetails) {
                  // binary search
                  let foundStudent = false;
                  let low = 0;
                  let high = studentDetails.length - 1;

                  while (low <= high) {
                    let mid = Math.floor((low + high) / 2);
                    let midElement = studentDetails[mid];

                    if (students[i].index === midElement.index) {
                      // check if the student is already selected for any internship or not
                      if (midElement.Internship_status === false) {
                        // change the status of the student to unavailable
                        foundStudent = true;
                        midElement.Internship_status = true;
                        midElement.current_internship = company_name;
                        studentDetails[mid].internships_till_now.push(
                          company_name
                        );
                        studentDetails[mid].internship_start_date = start_date;
                        studentDetails[mid].internship_end_date = end_date;

                        break;
                      } else {
                        // Error: Student is already selected for any internship
                        return res.status(400).json({
                          message: `Student with roll no ${midElement.roll_no} is already selected for ${midElement.current_internship} internship`,
                        });
                      }
                    } else if (students[i].index < midElement.index) {
                      // search in the left half
                      high = mid - 1;
                    } else {
                      // search in the right half
                      low = mid + 1;
                    }
                  }

                  if (!foundStudent) {
                    // Error: Student not found
                    return res.status(400).json({
                      message: `Student with roll no ${students[i].roll_no} is not found in the department ${department_name} with batch year ${year_batch}`,
                    });
                  }
                }
              }
            }
          });

          // save the data
          const savedOfficerDetails = await Officer.save();
          if (!savedOfficerDetails) {
            return res
              .status(400)
              .json({ message: "Error in saving the officer details" });
          } else {
            let successfully_send = false;
            if (selectedstudents.length === 1) {
              sendEmailForConfirmedStudents(
                Officer,
                Company,
                selectedstudents[0].department_name,
                selectedstudents[0].year_batch,
                selectedstudents[0].start_date,
                selectedstudents[0].end_date,
                selectedstudents[0].student_details
              )
                .then((response) => {
                  // Success
                  successfully_send = true;
                })
                .catch((error) => (successfully_send = false));
            } else {
              selectedstudents.map((e: any, i: number) => {
                sendEmailForConfirmedStudents(
                  Officer,
                  Company,
                  e.department_name,
                  e.year_batch,
                  e.start_date,
                  e.end_date,
                  selectedstudents[i].student_details
                )
                  .then((response) => {
                    // Success
                    successfully_send = true;
                  })
                  .catch((error) => (successfully_send = false));
              });
            }
            // Success
            return res.status(200).json({
              message:
                "Successfully changed the status of the students to unavailable",
            });
          }
        }
      }
    }
  } catch (error) {
    // Error:
    return res.status(500).json("Error retrieving Companies: " + error);
  }
};

// confirm the selected students department wise to be unavailable with no Date Provided
export const confirmSelectedStudentsWithNoDateProvided = async (
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
      // get the data from frontend
      const { company_id, company_name, selectedstudents } = req.body;
      if (!company_id || !selectedstudents) {
        // Error: Data not found
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        // find the Officer
        const Officer = await OfficerModel.findById({ _id: tokenVerify.data });
        const Company = await CompanyModel.findById({ _id: company_id });
        if (!Officer || !Company) {
          return res
            .status(404)
            .json({ message: "Officer or Company not found" });
        } else {
          // take out the data from selectedstudents
          const { department_name, year_batch } = selectedstudents[0];

          let foundElement: Department | null = null;
          // find the department and year_batch in officer
          for (let i = 0; i < Officer.college_details.length; i++) {
            if (
              Officer.college_details[i].department_name === department_name &&
              Officer.college_details[i].year_batch === year_batch
            ) {
              foundElement = Officer.college_details[i];
              break;
            }
          }

          if (foundElement === null) {
            // Error: Department not found
            return res.status(404).json({
              message: `Department ${department_name} with batch year ${year_batch} not found`,
            });
          } else {
            // find the student in the foundElement

            selectedstudents[0].student_details.map((e: Students) => {
              // check if the student is already selected for any internship or not boolean

              const studentDetails = foundElement?.student_details;
              if (studentDetails) {
                // binary search
                let foundStudent = false;
                let low = 0;
                let high = studentDetails.length - 1;

                while (low <= high) {
                  let mid = Math.floor((low + high) / 2);
                  let midElement = studentDetails[mid];

                  if (e.index === midElement.index) {
                    // check if the student is already selected for any internship or not
                    if (midElement.Internship_status === false) {
                      // change the status of the student to unavailable
                      foundStudent = true;
                      midElement.Internship_status = true;
                      midElement.current_internship = company_name;
                      studentDetails[mid].internships_till_now.push(
                        company_name
                      );
                      break;
                    } else {
                      // Error: Student is already selected for any internship
                      return res.status(400).json({
                        message: `Student with roll no ${midElement.roll_no} is already selected for ${midElement.current_internship} internship`,
                      });
                    }
                  } else if (e.index < midElement.index) {
                    // search in the left half
                    high = mid - 1;
                  } else {
                    // search in the right half
                    low = mid + 1;
                  }
                }

                if (!foundStudent) {
                  // Error: Student not found
                  return res.status(400).json({
                    message: `Student with roll no ${e.roll_no} is not found in the department ${department_name} with batch year ${year_batch}`,
                  });
                }
              }
            });

            // save the data
            const savedOfficerDetails = await Officer.save();
            if (!savedOfficerDetails) {
              return res
                .status(400)
                .json({ message: "Error in saving the officer details" });
            } else {
              return res.status(200).json({
                message:
                  "Successfully changed the status of the students to unavailable",
              });
            }
          }
        }
      }
    } else {
      // Error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (error) {
    // Error:
    return res
      .status(500)
      .json({ message: "Error retrieving Companies details" });
  }
};

// Before marking the students are unavailable making them unavailable
export const makeSelectedStudentsUnavailableConfirm = async (
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
      // get the data of Officer
      const Officer = await OfficerModel.findById({ _id: tokenVerify.data });
      const { company_id, company_name, selectedstudents } = req.body;
      if (!company_id || !company_name || !selectedstudents) {
        // Error: Data not found
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        // find the Company
        const Company = await CompanyModel.findById({ _id: company_id });
        if (!Company || !Officer) {
          // Error: Company or Officer not found
          return res
            .status(404)
            .json({ message: "Company or Officer not found" });
        } else {
          // take out the data from selectedstudents
          const { department_name, year_batch } = selectedstudents[0];
          //
          const subscribed_company = Officer.subscribed_company;
          let foundSubscribedCompany: subscribedCompany | null = null;
          for (let i = 0; i < subscribed_company.length; i++) {
            // find the company in the officer
            if (subscribed_company[i].company_id === company_id) {
              foundSubscribedCompany = subscribed_company[i];
              break;
            }
          }

          if (foundSubscribedCompany === null) {
            // Error: Company not found in the officer
            return res
              .status(404)
              .json({ message: "Company not found in the officer" });
          }

          const officerSelectedStudents: selectedStudentsInterface[] =
            foundSubscribedCompany.selectedbycompany;

          let foundDepartment: Boolean = false;
          for (let i = 0; i < officerSelectedStudents.length; i++) {
            if (
              officerSelectedStudents[i].department_name === department_name &&
              officerSelectedStudents[i].year_batch === year_batch
            ) {
              // mark the data as confirmed
              foundDepartment = true;
              officerSelectedStudents[i].confirmed = true;
              break;
            }
          }

          if (!foundDepartment) {
            // Error: Department not found in the officer
            return res
              .status(404)
              .json({ message: "Department not found in the officer" });
          }

          // find the officer in the company
          const subscribed_officer = Company.subscribed_officer;
          let foundSubscribedOfficer: subscribedOfficer | null = null;
          for (let i = 0; i < subscribed_officer.length; i++) {
            if (subscribed_officer[i].officer_id === tokenVerify.data) {
              // find the officer in the company
              foundSubscribedOfficer = subscribed_officer[i];
              break;
            }
          }

          if (foundSubscribedOfficer === null) {
            // Error: Officer not found in the company
            return res
              .status(404)
              .json({ message: "Officer not found in the company" });
          }

          const companySelectedStudents: selectedStudentsInterface[] =
            foundSubscribedOfficer.selectedbycompany;

          let foundDepartmentInCompany: Boolean = false;
          for (let i = 0; i < companySelectedStudents.length; i++) {
            if (
              companySelectedStudents[i].department_name === department_name &&
              companySelectedStudents[i].year_batch === year_batch
            ) {
              // mark the data as confirmed
              foundDepartmentInCompany = true;
              companySelectedStudents[i].confirmed = true;
              break;
            }
          }

          if (!foundDepartmentInCompany) {
            // Error: Department not found in the company
            return res
              .status(404)
              .json({ message: "Department not found in the company" });
          }

          // save the data
          const savedOfficerDetails = await Officer.save();
          const savedCompanyDetails = await Company.save();

          if (!savedOfficerDetails || !savedCompanyDetails) {
            // Error: Error in saving the officer details
            return res
              .status(400)
              .json({ message: "Error in saving the officer details" });
          } else {
            // Success: Successfully confirmed the selected students
            return res.status(200).json({
              message: "Successfully confirmed the selected students",
            });
          }
        }
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

// marking the students are unavailable failed making them available
export const makeSelectedStudentsavailableFailed = async (
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
      // get the data of Officer
      const Officer = await OfficerModel.findById({ _id: tokenVerify.data });
      const { company_id, company_name, selectedstudents } = req.body;
      if (!company_id || !company_name || !selectedstudents) {
        // Error: Data not found
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        // find the Company
        const Company = await CompanyModel.findById({ _id: company_id });
        if (!Company || !Officer) {
          // Error: Company or Officer not found
          return res
            .status(404)
            .json({ message: "Company or Officer not found" });
        } else {
          // take out the data from selectedstudents
          const { department_name, year_batch } = selectedstudents[0];

          const subscribed_company = Officer.subscribed_company;
          let foundSubscribedCompany: subscribedCompany | null = null;
          for (let i = 0; i < subscribed_company.length; i++) {
            if (subscribed_company[i].company_id === company_id) {
              // find the company in the officer
              foundSubscribedCompany = subscribed_company[i];
              break;
            }
          }

          if (foundSubscribedCompany === null) {
            // Error: Company not found in the officer
            return res
              .status(404)
              .json({ message: "Company not found in the officer" });
          }

          const officerSelectedStudents: selectedStudentsInterface[] =
            foundSubscribedCompany.selectedbycompany;

          let foundDepartment: Boolean = false;
          for (let i = 0; i < officerSelectedStudents.length; i++) {
            if (
              officerSelectedStudents[i].department_name === department_name &&
              officerSelectedStudents[i].year_batch === year_batch
            ) {
              // find the department in the officer
              foundDepartment = true;
              officerSelectedStudents[i].confirmed = false;
              break;
            }
          }

          if (!foundDepartment) {
            // Error: Department not found in the officer
            return res
              .status(404)
              .json({ message: "Department not found in the officer" });
          }

          const subscribed_officer = Company.subscribed_officer;
          let foundSubscribedOfficer: subscribedOfficer | null = null;
          for (let i = 0; i < subscribed_officer.length; i++) {
            if (subscribed_officer[i].officer_id === tokenVerify.data) {
              // find the officer in the company
              foundSubscribedOfficer = subscribed_officer[i];
              break;
            }
          }

          if (foundSubscribedOfficer === null) {
            // Error: Officer not found in the company
            return res
              .status(404)
              .json({ message: "Officer not found in the company" });
          }

          const companySelectedStudents: selectedStudentsInterface[] =
            foundSubscribedOfficer.selectedbycompany;

          let foundDepartmentInCompany: Boolean = false;
          for (let i = 0; i < companySelectedStudents.length; i++) {
            if (
              companySelectedStudents[i].department_name === department_name &&
              companySelectedStudents[i].year_batch === year_batch
            ) {
              // find the department in the company
              foundDepartmentInCompany = true;
              companySelectedStudents[i].confirmed = false;
              break;
            }
          }

          if (!foundDepartmentInCompany) {
            // Error: Department not found in the company
            return res
              .status(404)
              .json({ message: "Department not found in the company" });
          }

          // save the data
          const savedOfficerDetails = await Officer.save();
          const savedCompanyDetails = await Company.save();

          if (!savedOfficerDetails || !savedCompanyDetails) {
            // Error: Error in saving the officer details
            return res
              .status(400)
              .json({ message: "Error in saving the officer details" });
          } else {
            // Success: Successfully confirmed the selected students
            return res.status(200).json({
              message: "Successfully confirmed the selected students",
            });
          }
        }
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

// get all selected students department wise and batch-year wise with Date Provided
export const getAllSelectedStudentsByCompanies = async (
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
      const officer = await OfficerModel.findById({ _id: tokenVerify.data });

      if (!officer) {
        return res.status(404).json({ message: "Officer not found" });
      } else {
        const { company_id, department_name, year_batch } = req.body;
        if (!company_id || !department_name || !year_batch) {
          return res.status(400).json({ message: "Incomplete Data" });
        } else {
          // find the company in the officer
          let foundCompany: subscribedCompany | null = null;
          for (let i = 0; i < officer.subscribed_company.length; i++) {
            if (officer.subscribed_company[i].company_id === company_id) {
              foundCompany = officer.subscribed_company[i];
              break;
            }
          }

          if (foundCompany === null) {
            return res.status(404).json({ message: "Company not found" });
          } else {
            // find the department in the company
            let foundDepartment: selectedStudentsInterface | null = null;
            for (let i = 0; i < foundCompany.selectedbycompany.length; i++) {
              if (
                foundCompany.selectedbycompany[i].department_name ===
                  department_name &&
                foundCompany.selectedbycompany[i].year_batch === year_batch
              ) {
                foundDepartment = foundCompany.selectedbycompany[i];
                break;
              }
            }

            if (foundDepartment === null) {
              return res.status(404).json({ message: "Department not found" });
            } else {
              return res.status(200).json({
                message: "Get All Selected Students Successful",
                data: foundDepartment,
              });
            }
          }
        }
      }
    } else {
      // error:
      return res
        .status(500)
        .json({ message: "Problem in verifying the token" });
    }
  } catch (error) {
    // Error:
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getCollegeDepartmentAndYears = async (
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
      const officer = await OfficerModel.findById({ _id: tokenVerify.data });

      if (!officer) {
        // Error
        return res.status(404).json({ message: "Officer not found" });
      } else {
        let details: batchwiseDepartmentsInterface[] = [];
        officer.college_details.map((e: Department) => {
          // finding the department in details array
          const data = details.find((obj) => obj.year_batch === e.year_batch);
          if (data) {
            data.departments = [...data.departments, e.department_name];
          } else {
            // if not found push new details
            details.push({
              departments: [e.department_name],
              year_batch: e.year_batch,
            });
          }
        });

        if (details.length !== 0) {
          //Success: Data Successfully send
          return res.status(200).json({
            message: "Fetching the department name and year is successful",
            data: details,
          });
        } else {
          return res.status(200).json({ message: "No Data Found" });
        }
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

export const sendEmailByOfficerAction = (
  access: batchwiseDepartmentsInterface[],
  Officer: Officer,
  Company: Company
) => {
  return new Promise((resolve, reject) => {
    // configure the nodemailer
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "teamgenshinofficial@gmail.com",
        pass: "wkrivbrwloojnpzb",
      },
    });

    // Generate the department HTML markup
    const departmentHTML = access
      .map((entry) => {
        const { year_batch, departments } = entry;
        const departmentList = departments
          .map((department) => `<li>${department}</li>`)
          .join("");
        return `
          <div style="margin-bottom: 20px;">
            <h3 style="color: #00466a; margin-bottom: 5px;">Year Batch: ${year_batch}</h3>
            <ul style="list-style-type: disc; margin: 0 0 0 20px; padding: 0;">
              ${departmentList}
            </ul>
          </div>
        `;
      })
      .join("");

    let mail_configs = {
      from: "teamgenshinofficial@gmail.com",
      to: [Officer.email_id, Company.email_id],
      subject: `Internship Portal - Access Provided By ${Officer.college_name}`,
      html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Internship Portal - Access Provided Email</title>
</head>
<body>
<div style="font-family: Helvetica, Arial, sans-serif; min-width: 1000px; overflow: auto; line-height: 2;">
  <div style="margin: 50px auto; width: 70%; padding: 20px 0;">
    <div style="border-bottom: 1px solid #eee;">
      <a href="" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600;">Internship Portal</a>
    </div>
    <p style="font-size: 1.1em;">Hi users,</p>
    <p>Officer: ${Officer.username}, who is from college ${Officer.college_name}, has been given access of departments to the company representative ${Company.username} who is from Company: ${Company.company_name}.</p>
    <p>The Department Details are listed out with respect to the Year-Batch below. Check it out.</p>
    ${departmentHTML}
    <p style="font-size: 0.9em;">Regards,<br />Internship Portal</p>
    <hr style="border: none; border-top: 1px solid #eee;" />
    <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300;">
      <p>Internship Portal Inc</p>
      <p>Pimpri Chinchwad</p>
      <p>Pune</p>
    </div>
  </div>
</div>
</body>
</html>`,
    };
    // Send the mail to the gmails.
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        // Error: error found
        return reject({ message: `An error has occurred`, error: error });
      }
      // Success: Email Sent
      return resolve({ message: "Email sent successfully" });
    });
  });
};

// give email to both the company and officer regarding to the access
export const giveEmailToCompanyAndOfficerRegardingAccess = async (
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
      const officer_id = tokenVerify.data;
      const { company_id, access } = req.body;
      if (!company_id || !access) {
        // Error:
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        // find both the officer and company
        const foundOfficer = await OfficerModel.findById({ _id: officer_id });
        const foundCompany = await CompanyModel.findById({ _id: company_id });

        if (!foundOfficer || !foundCompany) {
          // Error:
          return res
            .status(404)
            .json({ message: "Officer or Company not found" });
        } else {
          let AccessMail = false;
          sendEmailByOfficerAction(access, foundOfficer, foundCompany)
            .then((response) => {
              // Success
              AccessMail = true;
            })
            .catch((error) => (AccessMail = false));
          return res.status(200).json({
            message: "Access given successfully",
            AccessMail: AccessMail ? "Email Sent" : "Email Not sent",
          });
        }
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

// get all the students accoding to the achievements and skills
export const getAllStudentsAccordingToAchievementsAndSkills = async (
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
      const { search, dept, year_batch } = req.body;
      if (!search) {
        // Error:
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        const officer = await OfficerModel.findById({ _id: tokenVerify.data });
        if (!officer) {
          // Error:
          return res.status(404).json({ message: "Officer not found" });
        } else if (dept && year_batch) {
          const department = officer.college_details.find(
            (e) => e.department_name === dept && e.year_batch === year_batch
          );
          if (department) {
            const searchRegex = new RegExp(search, "i"); // Case-insensitive regex for partial string search

            let students = department.student_details.filter(
              (student) =>
                student.achievements.some((achievement) =>
                  searchRegex.test(achievement)
                ) || student.skills.some((skill) => searchRegex.test(skill))
            );

            students = students.filter((e) => {
              return e.Internship_status === false;
            });

            if (students.length === 0) {
              // Error:
              return res.status(404).json({ message: "No Students Found" });
            } else {
              // Success:
              return res.status(200).json({
                message: "Students Found Successfully",
                data: students,
              });
            }
          } else {
            return res.status(404).json({ message: "Department not found" });
          }
        } else {
          const searchRegex = new RegExp(search, "i"); // Case-insensitive regex for partial string search

          let students = officer.college_details.flatMap((details) =>
            details.student_details.filter(
              (student) =>
                student.achievements.some((achievement) =>
                  searchRegex.test(achievement)
                ) || student.skills.some((skill) => searchRegex.test(skill))
            )
          );

          students = students.filter((e) => {
            return e.Internship_status === false;
          });

          if (students.length === 0) {
            // Error:
            return res.status(404).json({ message: "No Students Found" });
          } else {
            // Success:
            return res.status(200).json({
              message: "Students Found Successfully",
              data: students,
            });
          }
        }
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
