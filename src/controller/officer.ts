import { NextFunction, Request, Response } from "express";
import validator from "validator";
import OfficerModel, { Officer, Students, Department } from "../models/officer";
import multer from "multer";
import csvtojson from "csvtojson";
import { promisify } from "util";
import fs from "fs";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
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
import CompanyModel from "../models/company";

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
      let { email_id, password } = req.body;
      email_id = email_id.trim();
      password = password.trim();

      // finding an officer in database
      const data = await OfficerModel.find({ email_id: email_id });
      if (data.length !== 0) {
        let foundOfficer = data[0];
        const hashedPassword = foundOfficer.password;
        // comparing the password.
        bcrypt.compare(password, hashedPassword).then((results) => {
          if (results) {
            // Converting the id and email
            const token = jwt.sign(
              { data: data[0]._id, email_id: email_id },
              SecretKey
            );

            //Success: ogin Successful
            return res.status(200).send({
              message: "Login Successful",
              data: data[0]._id,
              token: token,
            });
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
export const verifyOfficerByToken = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      //Success: data: with id and email_id
      return res.status(200).send({
        message: "Login by token Successful",
        data: tokenVerify,
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
    let { username, email_id, mobile_no, password, college_name } = req.body;

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
      const company = await CompanyModel.find({ email_id: email_id });
      const officer = await OfficerModel.find({ email_id: email_id });
      if (officer.length !== 0 || company.length !== 0) {
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
              //Success: then returning the Officer Id of the Officer.
              return res.status(200).json({
                message: "This is Officer Create Page",
                data: user?._id,
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
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      // finding the officer by the ID got from the frontend
      const filter = { _id: req.params.id };
      let data = await findOfficer(filter);

      // checking if the officer exists or not
      if (data.length === 0) {
        //Error: Officer does not exist
        return res.status(404).json({ message: "Officer not found" });
      } else {
        const officer = data[0];

        // omiting the college details from officer
        const { college_details, password, ...responseData } = officer;

        // Success: pass the data
        return res.status(200).json({
          message: "This is Officer findone Page",
          data: responseData,
        });
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
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
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
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      const filter = { _id: req.params.id };
      // check for the data and delete
      let data = await deleteOfficer(filter);
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

// Forget Password OTP email send function.
export function sendEmail(req: Request, OTP: number, name: string) {
  return new Promise((resolve, reject) => {
    // Configure the nodemailer
    var transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "teamgenshinofficial@gmail.com",
        pass: "wkrivbrwloojnpzb",
      },
    });

    const mail_configs = {
      from: "teamgenshinofficial@gmail.com",
      to: req.body.email_id,
      subject: "Internship Portal Password Recovery",
      html: `<!DOCTYPE html>
<html lang="en" >
<head>
  <meta charset="UTF-8">
  <title>Internship Portal - OTP Email </title>
</head>
<body>
<!-- partial:index.partial.html -->
<div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
  <div style="margin:50px auto;width:70%;padding:20px 0">
    <div style="border-bottom:1px solid #eee">
      <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">OneCab</a>
    </div>
    <p style="font-size:1.1em">Hi ${name},</p>
    <p>Thank you for choosing Internship Portal. Use the following OTP to complete your Password Recovery Procedure. OTP is valid for 5 minutes</p>
    <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
    <p style="font-size:0.9em;">Regards,<br />Internship Portal</p>
    <hr style="border:none;border-top:1px solid #eee" />
    <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      <p>Internship Portal Inc</p>
      <p>Pimpri Chinchwad</p>
      <p>Pune</p>
    </div>
  </div>
</div>
<!-- partial -->
  
</body>
</html>`,
    };
    // Send the mail to the gmails.
    transporter.sendMail(mail_configs, function (error, info) {
      if (error) {
        // Error: error found
        return reject({ message: `An error has occured`, error: error });
      }
      // Success: Email Send
      return resolve({ message: "Email sent succesfuly" });
    });
  });
}

export const otpEmailSendController = async (req: Request, res: Response) => {
  try {
    // Find the data and generate OTP
    const OTP = Math.floor(Math.random() * 9000 + 1000);
    const findUser = await OfficerModel.find({ email_id: req.body.email_id });

    if (findUser.length !== 0) {
      // Creating the token using OTP and email_id
      const token = jwt.sign(
        { OTP: OTP, email_id: req.body.email_id },
        SecretKey
      );
      // Send Mail Function
      sendEmail(req, OTP, findUser[0].username)
        .then((response) => {
          // Success: message and token for forget password
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
        const findUser = await OfficerModel.find({ email_id: email_id });
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
              // Error: If password cannot be set
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

//Get Student Details
export const getDepartmentDetails = async (req: Request, res: Response) => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      // if data does not exists
      if (!req.params.id) {
        return res.status(400).json({ message: "Email not found" });
      }

      // Searching for the id passed in params
      const data = await OfficerModel.find({ _id: req.params.id });
      const sendData = data[0].college_details;

      // Success: details
      return res
        .status(200)
        .json({ message: "This is getDepartmentDetails", data: sendData });
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
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      // Find the officer by id
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
            // Error:
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
      // Success: Add the Department Details page
      return res.status(200).json({
        message: "This is Officer addDepartmentDetails page",
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

// Remove the Student details Department and batch wise
export const removeDepartmentDetails = async (
  req: Request,
  res: Response
): Promise<Response<any, Record<string, any>>> => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      // Find and delete the departments by their id
      const filter = { _id: req.params.id };
      const departmentDetailsId = req.body.department_id;
      let data = await findAndUpdate(
        filter,
        { $pull: { college_details: { _id: departmentDetailsId } } },
        { new: true }
      );
      if (data !== null) {
        // Success: send the data
        return res.status(200).json({
          message: "This is Officer Delete Page",
          data: data,
        });
      } else {
        // Error:
        return res.status(400).json({ message: "Cannot find Officer" });
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

export const addOneStudentDetails = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      const officerId: string = req.params.id;
      let newStudentDetails: Students = req.body;

      // Find Officer
      const officer: Officer | null = await OfficerModel.findById(officerId);

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
            data: officer,
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
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      // Find the officer
      const officerId: string = req.params.id;
      const departmentName: string = req.body.branch;
      const departmentYearBatch: number = req.body.year_batch;
      const officer: Officer | null = await OfficerModel.findById(officerId);

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
        data: officer,
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

// Access the CSV file provided by frontend and convert it to the JSON format

export const convertStudentsCSVtoJSON = async (req: Request, res: Response) => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      const officerId: string = req.params.id;
      const officer: Officer | null = await OfficerModel.findById(officerId);
      let departmentFound = false;

      // Checking for the officer details in database
      // converting the csv file to JSON
      let newStudentDetails: Students[];

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
            });

            // if departmentname and year batch exists or not
            if (!req.body.department_name || !req.body.year_batch) {
              // Error:
              return res.status(400).json({ error: "Data not uploaded" });
            }

            const newDepartment: Department = {
              department_name: req.body.department_name,
              year_batch: req.body.year_batch,
              student_details: newStudentDetails,
            };

            // push the new Department created
            officer.college_details.push(newDepartment);

            // Save the updated officer document
            await officer.save();

            // Success:
            return res.status(200).json({
              message: "CSV details added successfully",
              data: officer,
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
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      let { department_name, year_batch } = req.body;
      let id = req.params.id;
      if (!department_name || !year_batch || !id) {
        // Error:
        return res.status(400).json({ error: "Incomplete Data" });
      }

      const data = await OfficerModel.find({ _id: id });

      // bool for data bot found
      let sendData = false;
      data[0].college_details.map((e) => {
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
        let officerData = await OfficerModel.find({ _id: tokenVerify.data });
        let companydata = await CompanyModel.find({ _id: _id });
        if (companydata.length !== 0) {
          const dataCompany = {
            officer_id: officerData[0]._id,
            index: officerData[0].index,
            message: message,
            college_name: officerData[0].college_name,
            username: officerData[0].username,
          };
          const dataOfficer = {
            company_id: companydata[0]._id,
            index: companydata[0].index,
            message: message,
            username: companydata[0].username,
            company_name: companydata[0].company_name,
          };

          // push the data in company in subscribe_request_from_officer
          companydata[0].subscribe_request_from_officer.push(dataCompany);

          // push the data in officer in subscribe_request_to_company
          officerData[0].subscribe_request_to_company.push(dataOfficer);

          // save
          const savedCompany = await companydata[0].save();
          const savedOfficer = await officerData[0].save();

          if (savedCompany && savedOfficer) {
            // successfully saved the data
            return res.status(200).json({ message: "Request Send" });
          } else {
            // Error:
            return res.status(400).json({ message: "Request cannot send" });
          }
        } else {
          // Error:
          return res.status(400).json({ message: "Company does not exist" });
        }
      }
    } else {
      // Error:
      return res.status(400).json({ message: "Officer does not exist" });
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
      let company = await CompanyModel.find({ _id: company_id });
      if (company.length !== 0) {
        const officer = await OfficerModel.find({ _id: tokenVerify.data });

        // remove the requested data from officer
        officer[0].subscribe_request_from_company =
          officer[0].subscribe_request_from_company.filter(
            (obj) => obj.company_id !== company_id
          );

        // remove the requested data from company
        company[0].subscribe_request_to_officer =
          company[0].subscribe_request_to_officer.filter(
            (obj) => obj.officer_id !== tokenVerify.data
          );

        // add cancelled requested data to the officer
        const cancleOfficer = {
          company_id: company_id,
          index: company[0].index,
          message: message,
          username: company[0].username,
          company_name: company[0].company_name,
        };
        officer[0].cancelled_company.push(cancleOfficer);

        // add cancelled requested data to the company
        const cancleCompany = {
          officer_id: tokenVerify.data,
          index: officer[0].index,
          message: message,
          college_name: officer[0].college_name,
          username: officer[0].username,
        };
        company[0].cancelled_officer.push(cancleCompany);

        // save
        const savedCompany = await company[0].save();
        const savedOfficer = await officer[0].save();

        if (savedCompany && savedOfficer) {
          // Success :
          return res.status(200).json({
            message: "Cancelled the company request",
          });
        } else {
          // Error:
          return res.status(500).json({ message: "Cannot cancle request" });
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

// Add subscribed Officer
export const addSubscribedOfficerFromOfficer = async (
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
      // Find the Company

      const { company_id, message } = req.body;
      // check the data came from frontend or not
      if (!company_id || !message) {
        // Error:
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        let company = await CompanyModel.find({
          _id: company_id,
        });
        if (company.length !== 0) {
          const officer = await OfficerModel.find({ _id: tokenVerify.data });
          // remove from the request send by officer
          officer[0].subscribe_request_from_company =
            officer[0].subscribe_request_from_company.filter(
              (obj) => obj.company_id !== company_id
            );

          // remove from the officer from which the request has came
          company[0].subscribe_request_to_officer =
            company[0].subscribe_request_to_officer.filter(
              (obj) => obj.officer_id !== tokenVerify.data
            );
          // add to the subscribedOfficer schema of company
          const companyData = {
            officer_id: tokenVerify.data,
            index: officer[0].index,
            access: [],
            college_name: officer[0].college_name,
            username: officer[0].username,
            message: message,
            selectedstudents: [],
          };
          company[0].subscribed_officer.push(companyData);

          // add to the officer that requested to company
          const officerData = {
            company_id: company[0]._id,
            index: company[0].index,
            access: [],
            username: company[0].username,
            company_name: company[0].company_name,
            message: message,
            selectedstudents: [],
          };

          officer[0].subscribed_company.push(officerData);

          // save
          const savedOfficer = await company[0].save();
          const savedCompany = await officer[0].save();

          if (savedOfficer && savedCompany) {
            // Success :
            return res
              .status(200)
              .json({ message: "Successfully subscribed the company" });
          } else {
            // Error:
            return res
              .status(500)
              .json({ message: "Cannot subscribed the company" });
          }
        } else {
          // Error:
          return res.status(400).json({ message: "Company does not exist" });
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

export const giveAccessToCompanies = async (req: Request, res: Response) => {
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
        const foundOfficer = await OfficerModel.find({ _id: officer_id });
        const foundCompany = await CompanyModel.find({ _id: company_id });

        // if officer or company is not found
        if (foundOfficer.length === 0 || foundCompany.length === 0) {
          // Error:
          return res
            .status(400)
            .json({ message: "given Officer or Company not found" });
        } else {
          // change the access details in both officer and company side
          foundOfficer[0].subscribed_company.map((e) => {
            if (e.company_id === company_id) {
              e.access = access;
            }
          });

          foundCompany[0].subscribed_officer.map((e) => {
            if (e.officer_id === officer_id) {
              e.access = access;
            }
          });

          // save
          const savedCompany = await foundCompany[0].save();
          const savedOfficer = await foundOfficer[0].save();

          // success: Access is given successfully
          return res.status(200).json({
            message: "Access is given successfully",
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

export const getAllRequestedCompanies = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const foundOfficer = await OfficerModel.find({ _id: tokenVerify.data });

      if (foundOfficer.length === 0) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const allRequestedCompanies =
          foundOfficer[0].subscribe_request_from_company;

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
      const foundOfficer = await OfficerModel.find({ _id: tokenVerify.data });

      if (foundOfficer.length === 0) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const allRequestedbyOfficer =
          foundOfficer[0].subscribe_request_to_company;

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
      const foundOfficer = await OfficerModel.find({ _id: tokenVerify.data });

      if (foundOfficer.length === 0) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const subscribedcompanies = foundOfficer[0].subscribed_company;

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
      const foundOfficer = await OfficerModel.find({ _id: tokenVerify.data });

      if (foundOfficer.length === 0) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const allCancelledCompanies = foundOfficer[0].cancelled_company;

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
