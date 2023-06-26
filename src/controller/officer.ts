import { Request, Response } from "express";
import validator from "validator";
import multer from "multer";
import csvtojson from "csvtojson";
import { promisify } from "util";
import fs from "fs";
import bcrypt from "bcrypt";
import { shuffle } from "lodash";
import jwt from "jsonwebtoken";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";

import OfficerModel, { Officer, Students, Department } from "../models/officer";
import CompanyModel, { Company } from "../models/company";

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
        bcrypt.compare(password, hashedPassword).then((results) => {
          if (results) {
            // Converting the id and email
            const token = jwt.sign({ data: data._id }, SecretKey);

            //Success: ogin Successful
            return res.status(200).send({
              message: "Login Successful",
              data: data._id,
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
    let {
      username,
      email_id,
      mobile_no,
      password,
      college_name,
    }: {
      username: string;
      email_id: string;
      mobile_no: string;
      password: string;
      college_name: string;
    } = req.body;

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
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // finding the officer by the ID got from the frontend
      // const filter = ;
      let data = await OfficerModel.findById({ _id: tokenVerify.data }).select(
        " -password"
      );

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
          // remove the requested data from officer
          officer.subscribe_request_from_company =
            officer.subscribe_request_from_company.filter(
              (obj) => obj.company_id !== company_id
            );

          // remove the requested data from company
          company.subscribe_request_to_officer =
            company.subscribe_request_to_officer.filter(
              (obj) => obj.officer_id !== tokenVerify.data
            );

          // add cancelled requested data to the officer
          const cancelOfficer = {
            company_id: company_id,
            index: company.index,
            message: message,
            username: company.username,
            company_name: company.company_name,
          };
          officer.cancelled_company.push(cancelOfficer);

          // add cancelled requested data to the company
          const cancelCompany = {
            officer_id: tokenVerify.data,
            index: officer.index,
            message: message,
            college_name: officer.college_name,
            username: officer.username,
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
                  (obj) => obj.company_id !== company_id
                );

              // remove from the officer from which the request has come
              company.subscribe_request_to_officer =
                company.subscribe_request_to_officer.filter(
                  (obj) => obj.officer_id !== tokenVerify.data
                );

              // add to the subscribedOfficer schema of company
              const companyData = {
                officer_id: tokenVerify.data,
                index: officer.index,
                access: [],
                college_name: officer.college_name,
                username: officer.username,
                message: message,
                selectedstudents: [],
              };
              company.subscribed_officer.push(companyData);

              // add to the officer that requested to company
              const officerData = {
                company_id: company._id,
                index: company.index,
                access: [],
                username: company.username,
                company_name: company.company_name,
                message: message,
                selectedstudents: [],
              };

              officer.subscribed_company.push(officerData);

              // save
              const savedOfficer = await officer.save();
              const savedCompany = await company.save();

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
        const foundOfficer = await OfficerModel.findById({ _id: officer_id });
        const foundCompany = await CompanyModel.findById({ _id: company_id });

        // if officer or company is not found
        if (!foundOfficer || !foundCompany) {
          // Error:
          return res
            .status(400)
            .json({ message: "given Officer or Company not found" });
        } else {
          // change the access details in both officer and company side
          foundOfficer.subscribed_company.map((e) => {
            if (e.company_id === company_id) {
              e.access = access;
            }
          });

          foundCompany.subscribed_officer.map((e) => {
            if (e.officer_id === officer_id) {
              e.access = access;
            }
          });

          // save
          const savedCompany = await foundCompany.save();
          const savedOfficer = await foundOfficer.save();

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
      const shuffledOfficers = shuffle(filteredCompanies);

      // Define the chunk size and total number of chunks
      const chunkSize = 7; // Number of items in each chunk
      const totalChunks = Math.ceil(shuffledOfficers.length / chunkSize);

      // Get the requested chunk number from the query parameter
      const requestedChunk = parseInt(req.query.chunk as string) || 1;

      // Calculate the start and end indices of the chunk
      const startIndex = (requestedChunk - 1) * chunkSize;
      const endIndex = requestedChunk * chunkSize;

      // Slice the shuffled data array to get the desired chunk
      const chunkData = shuffledOfficers.slice(startIndex, endIndex);

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

// confirm the selected students department wise and batch-year wise to be unavailable with respect to the Date Provided
export const confirmSelectedStudents = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
    }
  } catch (error) {
    // Error:
    return res.status(500).json("Error retrieving Companies: " + error);
  }
};

// confirm the selected students department wise to be unavailable with no Date Provided

// find all selected students department wise and batch-year wise with Date Provided

// find all selected students department wise with no Date Provided
