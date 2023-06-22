import e, { Request, Response, NextFunction } from "express";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";
import { sendEmail } from "./officer";
import CompanyModel, { Company } from "../models/company";
import OfficerModel from "../models/officer";

// login Company in the Backend Controller
export const loginCompanyController = async (req: Request, res: Response) => {
  try {
    if (!req.body.email_id) {
      // Error:
      return res.status(400).json({ message: "Email not found" });
    } else if (!req.body.password) {
      // Error:
      return res.status(400).json({ message: "password not found" });
    } else {
      // Find the company
      let { email_id, password } = req.body;
      const data = await CompanyModel.findOne({ email_id: email_id });
      if (data) {
        // bcrypt the password
        let foundCompany = data;
        const hashedPassword = foundCompany.password;
        bcrypt.compare(password, hashedPassword).then((results) => {
          if (results) {
            const data = foundCompany._id;
            const token = jwt.sign({ data }, SecretKey);
            // Success
            return res.status(200).send({
              message: "Login Successful",
              token: token,
            });
          } else {
            // Error:
            return res.status(404).json({ message: "Wrong Password " });
          }
        });
      } else {
        // Error:
        return res.status(404).json({ message: "Company does not exist" });
      }
    }
  } catch (e) {
    // Error:
    return res.status(500).json({ message: "Server Error" });
  }
};

// verify Company by Token got from frontend
export const verifyCompanyByToken = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      // Success :
      return res.status(200).send({
        message: "Login by token Successful",
        data: tokenVerify,
      });
    } else {
      // Error:
      res.status(400).json({ message: "Cannot verify token" });
    }
  } catch (e) {
    // Error:
    return res.status(500).json({ message: "Problem in verifying the token" });
  }
};

// Create Company Controller
export const createCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    let { username, email_id, password, mobile_no, company_name } = req.body;

    if (!username || !email_id || !mobile_no || !password || !company_name) {
      // Data Incomplete Error
      return res.status(400).json({ message: "Data Incomplete Error" });
    }

    if (!validator.isEmail(email_id)) {
      // Invalid Email
      return res.status(400).json({ message: "Invalid Email" });
    }

    if (!/^[a-z A-Z0-9]*$/.test(username)) {
      // Invalid UserName
      return res
        .status(400)
        .json({ message: "Username should be alphanumeric" });
    }

    if (password.length < 8) {
      // Password should be at least 8 characters
      return res
        .status(400)
        .json({ message: "Password should be at least 8 characters" });
    }

    email_id = email_id.trim();
    password = password.trim();

    // Check if the email already exists in either Company or Officer
    const company = await CompanyModel.findOne({ email_id: email_id });
    const officer = await OfficerModel.findOne({ email_id: email_id });

    if (company || officer) {
      // Officer or Company already exists with this email id
      return res.status(400).json({
        message: "Officer or Company already exists with this email id",
      });
    }

    // Allocate the index
    const lastCompany = await CompanyModel.findOne().sort({ _id: -1 });
    let index: number;

    if (lastCompany && lastCompany.index === 0) {
      // If a mistake happens and index is set to 0, the next index will be stored as 1
      index = 1;
    } else if (lastCompany) {
      // Add 1 to the previous company index and store it in the new Company
      index = Number.isNaN(lastCompany.index) ? 0 : lastCompany.index + 1;
    } else {
      index = 1; // Default index when no company is found
    }

    // Hash the password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create the company
    const newCompany = await CompanyModel.create({
      index: index,
      username: username,
      password: hashedPassword,
      email_id: email_id,
      mobile_no: mobile_no,
      company_name: company_name,
      subscribe_request_from_officer: [],
      subscribe_request_to_officer: [],
      subscribed_officer: [],
      cancelled_officer: [],
      selected_students: [],
    });

    if (newCompany) {
      // Success: Company created successfully
      return res.status(200).json({ message: "Company created successfully" });
    } else {
      // Error: Failed to create company
      return res.status(500).json({ message: "Failed to create company" });
    }
  } catch (e) {
    // Error: Server Error
    return res.status(500).json({ message: "Server Error" });
  }
};

// Forget Password OTP email send function.
export const otpEmailSendController = async (req: Request, res: Response) => {
  try {
    const OTP = Math.floor(Math.random() * 9000 + 1000);
    const findUser = await CompanyModel.findOne({
      email_id: req.body.email_id,
    });

    if (findUser) {
      const token = jwt.sign(
        { OTP: OTP, email_id: req.body.email_id },
        SecretKey
      );
      // Send Email Function
      sendEmail(req, OTP, findUser.username)
        .then((response) => {
          // Success
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
        const findUser = await CompanyModel.findOne({ email_id: email_id });
        if (findUser) {
          // Password Hashing using bcrypt.
          const saltRounds = 10;
          bcrypt.hash(password, saltRounds).then(async (hashedPassword) => {
            findUser.password = hashedPassword;
            const passwordSet = await findUser.save();
            if (passwordSet) {
              //Success: if password is set successfully
              return res
                .status(200)
                .json({ message: "Password updated successfully" });
            } else {
              // If password cannot be set
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
        return res.status(404).json({ message: "email or password not found" });
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

// Find Get One Company by id Controller
export const findCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
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
      let data = await CompanyModel.findById({ _id: tokenVerify.data });
      return res.status(200).json({
        message: "This is Company's Find Page",
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

// Get All Companies in Database Controller
export const getAllCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(bearer.split(" ")[1], SecretKey);
    if (tokenVerify) {
      // FInd all the details
      let data = await CompanyModel.find().select(
        "-password -subscribe_request_from_officer -subscribe_request_to_officer -subscribed_officer -cancelled_officer "
      );
      if (data.length !== 0) {
        // Success:
        return res.status(200).json({
          message: "This is company's getAll Page",
          data: data,
        });
      } else {
        // Error:
        res.status(500).json({ message: "cannot find any company" });
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

// Delete Company by id Controller
export const deleteCompanyController = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    // verify the user
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // Find and Delete the company
      let data = await CompanyModel.findByIdAndDelete({
        _id: tokenVerify.data,
      });
      return res.status(200).json({
        message: "This is Company's Delete Page",
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

// Add subscribe request to Officer
export const addSubscribeRequestToOfficer = async (
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

    const { _id, message } = req.body;
    const company_id = tokenVerify.data;

    if (!_id || !message) {
      // Error: Incomplete Data
      return res.status(400).json({ message: "Incomplete Data" });
    }

    const companyData = await CompanyModel.findById({ _id: company_id });
    const officerData = await OfficerModel.findById({ _id: _id });

    if (!companyData) {
      // Error: Company not found
      return res.status(400).json({ message: "Company not found" });
    } else if (!officerData) {
      // Error: Officer not found
      return res.status(400).json({ message: "Officer not found" });
    } else {
      const foundInRequestToCompany =
        officerData.subscribe_request_to_company.some(
          (e) => e.company_id === company_id
        );

      const foundInRequestFromCompany =
        officerData.subscribe_request_from_company.some(
          (e) => e.company_id === company_id
        );

      const foundInSubscribedCompanies = officerData.subscribed_company.some(
        (e) => e.company_id === company_id
      );

      if (
        foundInRequestToCompany ||
        foundInRequestFromCompany ||
        foundInSubscribedCompanies
      ) {
        // Error: Already requested or subscribed
        return res
          .status(400)
          .json({ message: "Already requested or subscribed" });
      } else {
        const dataCompany = {
          officer_id: officerData._id,
          index: officerData.index,
          college_name: officerData.college_name,
          username: officerData.username,
          message: message,
        };

        const dataOfficer = {
          company_id: companyData._id,
          index: companyData.index,
          username: companyData.username,
          company_name: companyData.company_name,
          message: message,
        };

        // Push the data in company's subscribe_request_to_officer
        companyData.subscribe_request_to_officer.push(dataCompany);

        // Push the data in officer's subscribe_request_from_company
        officerData.subscribe_request_from_company.push(dataOfficer);

        // Save changes
        await companyData.save();
        await officerData.save();

        // Success: Request sent successfully
        return res.status(200).json({ message: "Request Sent" });
      }
    }
  } catch (e) {
    // Error: Server Error
    return res.status(500).json({ message: "Server Error" });
  }
};

// Add subscribed Officer
export const addSubscribedOfficerFromCompany = async (
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

    // Find
    const { officer_id, message } = req.body;

    if (!officer_id || !message) {
      // Error: Incomplete Data
      return res.status(400).json({ message: "Incomplete Data" });
    }

    const officer = await OfficerModel.findById(officer_id);

    if (!officer) {
      // Error: Officer not found
      return res.status(400).json({ message: "Officer not found" });
    }

    const foundInSubscribedCompanies = officer.subscribed_company.some(
      (e) => e.company_id === tokenVerify.data
    );

    const companyData = await CompanyModel.findById(tokenVerify.data);

    if (!companyData) {
      // Error: Company not found
      return res.status(400).json({ message: "Company not found" });
    } else {
      // Remove from the request sent by officer
      companyData.subscribe_request_from_officer =
        companyData.subscribe_request_from_officer.filter(
          (obj) => obj.officer_id !== officer_id
        );

      // Remove from the officer from which the request has come
      officer.subscribe_request_to_company =
        officer.subscribe_request_to_company.filter(
          (obj) => obj.company_id !== tokenVerify.data
        );

      // Add to the subscribedOfficer schema of company
      const subscribedOfficerData = {
        officer_id: officer_id,
        index: officer.index,
        college_name: officer.college_name,
        username: officer.username,
        access: [],
        message: message,
        selectedstudents: [],
      };
      companyData.subscribed_officer.push(subscribedOfficerData);

      // Add to the officer that requested the company
      const subscribedCompanyData = {
        company_id: companyData._id,
        index: companyData.index,
        access: [],
        username: companyData.username,
        company_name: companyData.company_name,
        message: message,
        selectedstudents: [],
      };
      officer.subscribed_company.push(subscribedCompanyData);

      // Save changes
      await companyData.save();
      await officer.save();

      // Success: Successfully subscribed to the company
      return res
        .status(200)
        .json({ message: "Successfully subscribed to the company" });
    }
  } catch (e) {
    // Error: Server Error
    return res.status(500).json({ message: "Server Error" });
  }
};

export const addCancelledRequest = async (req: Request, res: Response) => {
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

    // Find the officer
    const { officer_id, message } = req.body;

    if (!officer_id || !message) {
      // Error: Incomplete Data
      return res.status(400).json({ message: "Incomplete Data" });
    }

    const officer = await OfficerModel.findById(officer_id);

    if (!officer) {
      // Error: Officer not found
      return res.status(400).json({ message: "Officer not found" });
    }

    // Find the company
    const company = await CompanyModel.findById(tokenVerify.data);

    if (!company) {
      // Error: Company not found
      return res.status(400).json({ message: "Company not found" });
    } else {
      // Remove the requested data from officer
      officer.subscribe_request_to_company =
        officer.subscribe_request_to_company.filter(
          (obj) => obj.company_id !== tokenVerify.data
        );

      // Remove the requested data from company
      company.subscribe_request_from_officer =
        company.subscribe_request_from_officer.filter(
          (obj) => obj.officer_id !== officer_id
        );

      // Add cancelled requested data to the officer
      const cancelOfficer = {
        company_id: company._id,
        index: company.index,
        message: message,
        username: company.username,
        company_name: company.company_name,
      };
      officer.cancelled_company.push(cancelOfficer);

      // Add cancelled requested data to the company
      const cancelCompany = {
        officer_id: officer._id,
        index: officer.index,
        message: message,
        college_name: officer.college_name,
        username: officer.username,
      };
      company.cancelled_officer.push(cancelCompany);

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

// selected students by companies without dates

export const selectedStudentsByCompaniesWithoutDates = async (
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
      const { officer_id, selected_students } = req.body;
      const company_id = tokenVerify.data;
      if (!officer_id || !company_id || selected_students.length === 0) {
        // error:
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        // confirm the company and officer is both subscribed
        const verifyOfficer = await OfficerModel.findById({ _id: officer_id });
        const verifyCompany = await CompanyModel.findById({ _id: company_id });

        if (!verifyOfficer || !verifyCompany) {
          // error:
          return res
            .status(400)
            .json({ message: "Officer or company not found" });
        } else {
          const foundInCompany = verifyCompany.subscribed_officer.filter(
            (obj) => obj.officer_id === officer_id
          );
          const foundInOfficer = verifyOfficer.subscribed_company.filter(
            (obj) => obj.company_id === company_id
          );

          if (!foundInCompany || !foundInOfficer) {
            // error:
            return res.status(400).json({ message: "Invalid Subscription" });
          } else {
            // check if the data already exists in the officer or company side
            // then add the data into both the schemas
            // save them
            // Success: Data set Successfully
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

// selected students by companies with dates

export const selectedStudentsByCompaniesWithDates = async (
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
      const { officer_id, index, start_date, end_date, selected_students } =
        req.body;
      const company_id = tokenVerify.data;
      if (
        !officer_id ||
        !company_id ||
        !start_date ||
        !end_date ||
        !index ||
        selected_students.length === 0
      ) {
        // error:
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        // confirm the company and officer is both subscribed
        const verifyOfficer = await OfficerModel.findById({ _id: officer_id });
        const verifyCompany = await CompanyModel.findById({ _id: company_id });
        if (!verifyOfficer || !verifyCompany) {
          // error:
          return res
            .status(400)
            .json({ message: "Officer or company not found" });
        } else {
          const foundCompany = verifyCompany.subscribed_officer.filter(
            (obj) => obj.officer_id === officer_id
          );
          const foundOfficer = verifyOfficer.subscribed_company.filter(
            (obj) => obj.company_id === company_id
          );

          if (!foundCompany || !foundOfficer) {
            // error:
            return res.status(400).json({ message: "Invalid Subscription" });
          } else {
            // then add the data into both the schemas
            // save them
            // Success: Data set Successfully
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

// get Student details by department and year_batch through company
export const getStudentDetailsbyDeptAndYear = async (
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
      const company_id = tokenVerify.data;
      const { officer_id, year_batch, department_name } = req.body;
      if (!company_id || !officer_id || !year_batch || !department_name) {
        // error:
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        // find both the officer and company
        const foundOfficer = await OfficerModel.findById({ _id: officer_id });
        const foundCompany = await CompanyModel.findById({ _id: company_id });

        if (!foundCompany || !foundOfficer) {
          // error:
          return res
            .status(400)
            .json({ message: "Cannot find officer or company" });
        } else {
          // now confirn that company have access to the data in officer side
          let haveAccessToData = false;
          const companySubscribedDetails =
            foundOfficer.subscribed_company.filter((e) => {
              if (e.company_id === company_id) {
                return e;
              }
            });

          if (companySubscribedDetails.length === 0) {
            // error: Company is not subscribed
            return res
              .status(400)
              .json({ message: " Company is not subscribed" });
          } else {
            // find the year batch access is there or not for company
            const foundYearBatchInOfficer =
              companySubscribedDetails[0].access.filter((e) => {
                if (e.year_batch === year_batch) {
                  return e;
                }
              });
            if (foundYearBatchInOfficer.length === 0) {
              // error: Year Batch is not valid
              return res
                .status(400)
                .json({ message: "Year Batch is not valid" });
            } else {
              //find if company have access for the department
              foundYearBatchInOfficer[0].departments.filter((e) => {
                if (e === department_name) {
                  haveAccessToData = true;
                }
              });

              if (haveAccessToData === false) {
                // error: Year Batch is not valid
                return res
                  .status(400)
                  .json({ message: "You do not have access for this data" });
              } else {
                // bool for data bot found
                let sendData = false;
                foundOfficer.college_details.map((e) => {
                  if (
                    e.department_name === department_name &&
                    e.year_batch == year_batch
                  ) {
                    //Success: if we both the department and year_batch
                    sendData = true;

                    return res.status(200).json({
                      message:
                        "This is get Students details by dept and year API",
                      data: e,
                    });
                  }
                });
                // if the department does not exist in officer details.
                if (!sendData) {
                  // Error:
                  return res.status(400).json({
                    message: "Department not exist in officer details.",
                  });
                }
              }
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
  } catch (e) {
    // error:
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getAllRequestedOfficers = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const foundCompany = await CompanyModel.findById({
        _id: tokenVerify.data,
      });

      if (!foundCompany) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const getAllRequestedOfficers =
          foundCompany.subscribe_request_from_officer;

        if (getAllRequestedOfficers.length === 0) {
          // No Requested Companies
          return res.status(200).json({ message: "Not any Request" });
        } else {
          // Success:
          return res.status(200).json({
            message: "get All Requested Companies Successful",
            data: getAllRequestedOfficers,
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

export const getAllRequestsbyCompany = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const foundCompany = await CompanyModel.findById({
        _id: tokenVerify.data,
      });

      if (!foundCompany) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const getAllRequestedOfficers =
          foundCompany.subscribe_request_to_officer;

        if (getAllRequestedOfficers.length === 0) {
          // No Requested Companies
          return res.status(200).json({ message: "Not any Request" });
        } else {
          // Success:
          return res.status(200).json({
            message: "get All Requested Companies Successful",
            data: getAllRequestedOfficers,
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
      const foundCompany = await CompanyModel.findById({
        _id: tokenVerify.data,
      });

      if (!foundCompany) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const getAllCancelledRequests = foundCompany.cancelled_officer;

        if (getAllCancelledRequests.length === 0) {
          // No Requested Companies
          return res
            .status(200)
            .json({ message: "Not any Cancelled Requests" });
        } else {
          // Success:
          return res.status(200).json({
            message: "get All Requested Companies Successful",
            data: getAllCancelledRequests,
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

export const getAllSubscribedOfficers = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const foundCompany = await CompanyModel.findById({
        _id: tokenVerify.data,
      });

      if (!foundCompany) {
        // Error:
        return res.status(400).json({ message: "Officer does not exist" });
      } else {
        const getAllSubscribedOfficers =
          foundCompany.subscribe_request_to_officer;

        if (getAllSubscribedOfficers.length === 0) {
          // No Requested Companies
          return res.status(200).json({ message: "Not any Request" });
        } else {
          // Success:
          return res.status(200).json({
            message: "get All Requested Companies Successful",
            data: getAllSubscribedOfficers,
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

export const getAllOfficerByFilter = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const officers = await OfficerModel.find({})
        .select(
          "-college_details -subscribe_request_from_company -subscribe_request_to_company -subscribed_company"
        )
        .exec();

      // Assuming you have retrieved the company data
      const companyData = await CompanyModel.findById({
        _id: tokenVerify.data,
      })
        .populate("subscribe_request_from_officer")
        .populate("subscribe_request_to_officer")
        .populate("subscribed_officer")
        .exec();

      if (!companyData) {
        return res.status(404).json({ message: "Company data not found." });
      }

      // Remove officers present in company data
      const filteredOfficers = officers.filter((officer) => {
        const officerId = officer._id.toString();
        const isSubscribeRequestFromOfficer =
          companyData.subscribe_request_from_officer.some(
            (req) => req.officer_id.toString() === officerId
          );
        const isSubscribeRequestToOfficer =
          companyData.subscribe_request_to_officer.some(
            (req) => req.officer_id.toString() === officerId
          );
        const isSubscribedOfficer = companyData.subscribed_officer.some(
          (sub) => sub.officer_id.toString() === officerId
        );

        return !(
          isSubscribeRequestFromOfficer ||
          isSubscribeRequestToOfficer ||
          isSubscribedOfficer
        );
      });

      return res
        .status(200)
        .json({ message: "Filtered officers", data: filteredOfficers });
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
