import e, { Request, Response, NextFunction } from "express";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";
import CompanyModel, { Company } from "../models/company";

import OfficerModel, {
  Officer,
  Students,
  selectedStudentsInterface,
  subscribeRequest,
  subscribedCompany,
} from "../models/officer";
import verificationModel from "../models/verification";
import { sendEmail } from "./otp";

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
      let { email_id, password }: { email_id: string; password: string } =
        req.body;
      const data = await CompanyModel.findOne({ email_id: email_id });
      if (data) {
        // bcrypt the password
        let foundCompany = data;
        const hashedPassword = foundCompany.password;
        bcrypt.compare(password, hashedPassword).then(async (results) => {
          if (results) {
            const data = foundCompany._id;
            const tokenToSave = jwt.sign({ data: data }, SecretKey);

            return res.status(200).json({
              message: "Login Successful",
              token: tokenToSave,
              data: foundCompany,
            });

            // Creating the OTP for two step verification
            // const otp = Math.floor(100000 + Math.random() * 900000);

            // Create verification Model
            // const createdVerification = await verificationModel.create({
            //   user_token: tokenToSave,
            //   user: "company",
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
            // sendEmail(req, otp, foundCompany.username, "validation")
            //   .then((response) => {
            // Success: Login Successful
            // res.status(200).json({ message: response, token: token });
            // })
            // .catch((error) => res.status(500).json({ error: error.message }));
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
// export const verifyCompanyTwoStepValidation = async (
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
//         verification.user === "company"
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
// verify Company by Token got from frontend
export const verifyCompanyByToken = async (req: Request, res: Response) => {
  try {
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      // Success :
      return res.status(200).send({
        message: "Login by token Successful",
        data: tokenVerify.data,
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
    const bearerHeader = req.headers.authorization;
    const bearer: string = bearerHeader as string;
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      let { username, password, mobile_no, company_name } = req.body;

      let email_id = tokenVerify.email_id.toLowerCase();

      if (!username || !mobile_no || !password || !company_name) {
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
      const company = await CompanyModel.exists({ email_id: email_id });
      const officer = await OfficerModel.exists({ email_id: email_id });

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
        return res
          .status(200)
          .json({ message: "Company created successfully" });
      } else {
        // Error: Failed to create company
        return res.status(500).json({ message: "Failed to create company" });
      }
    } else {
      // Error:
      res.status(400).json({ message: "Cannot verify token" });
    }
  } catch (e) {
    // Error: Server Error
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
    const tokenVerify = jwt.verify(
      bearer.split(" ")[1],
      SecretKey
    ) as jwt.JwtPayload;
    if (tokenVerify) {
      const company = await CompanyModel.exists({ _id: tokenVerify.data });
      // finding the officer by the ID got from the frontend
      if (!company) {
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
        // Error: Problem in verifying
        return res.status(500).json({ message: "valid Company not found." });
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
// export const addSubscribedOfficerFromCompany = async (
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

//     if (!tokenVerify) {
//       // Error: Problem in verifying the token
//       return res
//         .status(500)
//         .json({ message: "Problem in verifying the token" });
//     }

//     const company = await CompanyModel.exists({ _id: tokenVerify.data });
//     if (!company) {
//       // Error: Problem in verifying the token
//       return res.status(500).json({ message: "valid Company not found. " });
//     }

//     // Find
//     const { officer_id, message } = req.body;

//     if (!officer_id || !message) {
//       // Error: Incomplete Data
//       return res.status(400).json({ message: "Incomplete Data" });
//     }

//     const officer = await OfficerModel.findById(officer_id);

//     if (!officer) {
//       // Error: Officer not found
//       return res.status(400).json({ message: "Officer not found" });
//     }

//     const foundInSubscribedCompanies = officer.subscribed_company.some(
//       (e) => e.company_id === tokenVerify.data
//     );

//     const companyData = await CompanyModel.findById(tokenVerify.data);

//     if (!companyData) {
//       // Error: Company not found
//       return res.status(400).json({ message: "Company not found" });
//     } else {
//       // Remove from the request sent by officer
//       companyData.subscribe_request_from_officer =
//         companyData.subscribe_request_from_officer.filter(
//           (obj) => obj.officer_id !== officer_id
//         );

//       // Remove from the officer from which the request has come
//       officer.subscribe_request_to_company =
//         officer.subscribe_request_to_company.filter(
//           (obj) => obj.company_id !== tokenVerify.data
//         );

//       // Add to the subscribedOfficer schema of company
//       const subscribedOfficerData = {
//         officer_id: officer_id,
//         index: officer.index,
//         college_name: officer.college_name,
//         username: officer.username,
//         access: [],
//         message: message,
//         selectedstudents: [],
//       };
//       companyData.subscribed_officer.push(subscribedOfficerData);

//       // Add to the officer that requested the company
//       const subscribedCompanyData = {
//         company_id: companyData._id,
//         index: companyData.index,
//         access: [],
//         username: companyData.username,
//         company_name: companyData.company_name,
//         message: message,
//         selectedstudents: [],
//       };
//       officer.subscribed_company.push(subscribedCompanyData);

//       // Save changes
//       await companyData.save();
//       await officer.save();

//       // Success: Successfully subscribed to the company
//       return res
//         .status(200)
//         .json({ message: "Successfully subscribed to the company" });
//     }
//   } catch (e) {
//     // Error: Server Error
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

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

    const officer = await OfficerModel.findById({ _id: officer_id });

    if (!officer) {
      // Error: Officer not found
      return res.status(400).json({ message: "Officer not found" });
    }

    // Find the company
    const company = await CompanyModel.findById({ _id: tokenVerify.data });

    if (!company) {
      // Error: Company not found
      return res.status(400).json({ message: "Company not found" });
    } else {
      let found_in_Officer = false;
      let found_in_Company = false;
      // Remove the requested data from officer
      officer.subscribe_request_to_company =
        officer.subscribe_request_to_company.filter((obj) => {
          if (obj.company_id === tokenVerify.data) {
            found_in_Officer = true;
          }
          return obj.company_id !== tokenVerify.data;
        });

      // Remove the requested data from company
      company.subscribe_request_from_officer =
        company.subscribe_request_from_officer.filter((obj) => {
          if (obj.officer_id === officer_id) {
            found_in_Company = true;
          }
          return obj.officer_id !== officer_id;
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
        cancelled_by: "company",
      };
      officer.cancelled_company.push(cancelOfficer);

      // Add cancelled requested data to the company
      const cancelCompany = {
        officer_id: officer._id,
        index: officer.index,
        message: message,
        college_name: officer.college_name,
        username: officer.username,
        cancelled_by: "company",
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

export const addCancelledRequestByCompany = async (
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
      // Find the data in company
      const { officer_id, message } = req.body;
      const company = await CompanyModel.findById({ _id: tokenVerify.data });
      if (company) {
        const officer = await OfficerModel.findById({ _id: officer_id });
        if (officer) {
          let found_in_Officer = false,
            found_in_Company = false;
          // remove the requested data from officer
          officer.subscribe_request_from_company =
            officer.subscribe_request_from_company.filter((obj) => {
              if (obj.company_id === tokenVerify.data) {
                found_in_Officer = true;
              }
              return obj.company_id !== tokenVerify.data;
            });

          // remove the requested data from company
          company.subscribe_request_to_officer =
            company.subscribe_request_to_officer.filter((obj) => {
              if (obj.officer_id === officer_id) {
                found_in_Company = true;
              }
              return obj.officer_id !== officer_id;
            });

          if (!found_in_Company || !found_in_Officer) {
            return res.status(400).json({ message: "Invalid Request" });
          }

          // add cancelled requested data to the officer
          const cancelOfficer = {
            company_id: tokenVerify.data,
            index: company.index,
            message: message,
            username: company.username,
            company_name: company.company_name,
            cancelled_by: "company",
          };
          officer.cancelled_company.push(cancelOfficer);

          // add cancelled requested data to the company
          const cancelCompany = {
            officer_id: officer_id,
            index: officer.index,
            message: message,
            college_name: officer.college_name,
            username: officer.username,
            cancelled_by: "company",
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

// const request = async () => {
//   const officer = await OfficerModel.findById({
//     _id: "64943d276c14235b2ccc6cbd",
//   });
//   const company = await CompanyModel.findById({
//     _id: "64944d6fd614176f5a947e91",
//   });
//   if (!officer || !company) {
//     return;
//   } else {
//     sendEmailByCompanyAction(officer, company, "ENTC", 2024, null, null, [
//       {
//         index: 1,
//         name: "Dummy_Student_Name1",
//         email_id: "dummy_student_email1@gmail.com",
//         college_name: "Dummy_College_Name",
//         location: "Pune",
//         mobile_no: "7789456122",
//         branch: "Dummy_Department",
//         roll_no: "vrght",
//         achievements: [
//           "Dummy_Achievement_1,Dummy_Achievement_2,Dummy_Achievement_3,Dummy_Achievement_4",
//         ],
//         skills: ["Dummy_Skills_1,Dummy_Skills_2,Dummy_Skills_3,Dummy_Skills_4"],
//         hobbies: [
//           "Dummy_Hobbies_1,Dummy_Hobbies_2,Dummy_Hobbies_3,Dummy_Hobbies_4",
//         ],
//         cgpa: 7.89,
//         year_batch: 2024,
//         backlog: false,
//         linked_profile_link: "https://www.linkedin.com/",
//         github_profile_link: "https://github.com/",
//         leetcode_profile: "https://leetcode.com/",
//         geeksforgeeks_profile: "https://geeksforgeeks.org/",
//         tenth_percentage: 84.96,
//         twelve_percentage: 77,
//         diploma_percentage: 0,
//         _id: "649449aa3164d274ecf676fd",
//       },
//       {
//         index: 2,
//         name: "Dummy_Student_Name2",
//         email_id: "dummy_student_email1@gmail.com",
//         college_name: "Dummy_College_Name",
//         location: "Pune",
//         mobile_no: "9175210152",
//         branch: "Dummy_Department",
//         roll_no: "eae",
//         achievements: [
//           "Dummy_Achievement_1,Dummy_Achievement_2,Dummy_Achievement_3,Dummy_Achievement_5",
//         ],
//         skills: ["Dummy_Skills_1,Dummy_Skills_2,Dummy_Skills_3,Dummy_Skills_5"],
//         hobbies: [
//           "Dummy_Hobbies_1,Dummy_Hobbies_2,Dummy_Hobbies_3,Dummy_Hobbies_5",
//         ],
//         cgpa: 7.55,
//         year_batch: 2024,
//         backlog: false,
//         linked_profile_link: "https://www.linkedin.com/",
//         github_profile_link: "https://github.com/",
//         leetcode_profile: "https://leetcode.com/",
//         geeksforgeeks_profile: "https://geeksforgeeks.org/",
//         tenth_percentage: 81.96,
//         twelve_percentage: 78,
//         diploma_percentage: 0,
//         _id: "649449aa3164d274ecf676fe",
//       },
//       {
//         index: 3,
//         name: "Dummy_Student_Name3",
//         email_id: "dummy_student_email1@gmail.com",
//         college_name: "Dummy_College_Name",
//         location: "Pune",
//         mobile_no: "9175210153",
//         branch: "Dummy_Department",
//         roll_no: "cac",
//         achievements: [
//           "Dummy_Achievement_1,Dummy_Achievement_2,Dummy_Achievement_3,Dummy_Achievement_6",
//         ],
//         skills: ["Dummy_Skills_1,Dummy_Skills_2,Dummy_Skills_3,Dummy_Skills_6"],
//         hobbies: [
//           "Dummy_Hobbies_1,Dummy_Hobbies_2,Dummy_Hobbies_3,Dummy_Hobbies_6",
//         ],
//         cgpa: 9.99,
//         year_batch: 2024,
//         backlog: false,
//         linked_profile_link: "https://www.linkedin.com/",
//         github_profile_link: "https://github.com/",
//         leetcode_profile: "https://leetcode.com/",
//         geeksforgeeks_profile: "https://geeksforgeeks.org/",
//         tenth_percentage: 24.96,
//         twelve_percentage: 47,
//         diploma_percentage: 0,
//         _id: "649449aa3164d274ecf676ff",
//       },
//     ]);
//   }
// };

// request().then((e) => {
//   console.log("Done");
// });

export const sendEmailByCompanyAction = (
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
    <p>Company representative ${Company.username} from ${Company.company_name} has selected a list of students from the Department of ${department_name}, batch ${year_batch}, at ${Officer.college_name}, which is handled by ${Officer.username}.</p>
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
    <p>Company representative ${Company.username} from ${
          Company.company_name
        } selected a list of students from the Department of ${department_name}, batch ${year_batch}, starting from ${start_date
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "/")} to ${end_date
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "/")}. The selection was made from ${
          Officer.college_name
        }, and it is handled by ${Officer.username}.</p>
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
      const {
        officer_id,
        department_name,
        year_batch,
        selected_students,
      }: {
        officer_id: string;
        department_name: string;
        year_batch: number;
        selected_students: Students[];
      } = req.body;
      const company_id = tokenVerify.data;
      if (
        !officer_id ||
        !company_id ||
        !department_name ||
        !year_batch ||
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
          let foundInCompany = false;
          let foundInOfficer = false;
          let foundInCompanySubscribed = false;
          // then add the data into both the schemas
          let data: selectedStudentsInterface = {
            department_name: department_name,
            year_batch: year_batch,
            end_date: null,
            start_date: null,
            confirmed: false,
            student_details: selected_students,
          };

          // add the data in company and check if the data exist in both or not

          for (const obj of verifyCompany.subscribed_officer) {
            if (obj.officer_id === officer_id) {
              foundInCompany = true;
              if (
                obj.selectedstudents.some((student) => {
                  return (
                    student.department_name === department_name &&
                    student.year_batch === year_batch
                  );
                }) === false
              ) {
                obj.selectedstudents.push(data);
              } else {
                foundInCompanySubscribed = true;
                return res.status(400).json({
                  message: "Data about selected students already exists",
                });
              }
              break; // Exit the loop after finding a match
            }
          }

          if (!foundInCompany || !foundInCompanySubscribed) {
            verifyOfficer.subscribed_company.filter((obj) => {
              if (obj.company_id === company_id) {
                foundInOfficer = true;
                obj.selectedstudents.push(data);
              }
            });

            if (!foundInCompany || !foundInOfficer) {
              return res.status(400).json({
                message: "Invalid Subscription",
              });
            } else {
              // save them
              const savedCompany = await verifyCompany.save();
              const savedOfficer = await verifyOfficer.save();

              let successfully_send = false;

              sendEmailByCompanyAction(
                verifyOfficer,
                verifyCompany,
                department_name,
                year_batch,
                null,
                null,
                selected_students
              )
                .then((response) => {
                  // Success
                  successfully_send = true;
                })
                .catch((error) => (successfully_send = false));
              // Success: Data set Successfully
              return res.status(200).json({
                message: "Data set Successfully",
                data: {
                  company: savedCompany,
                  officer: savedOfficer,
                  mailSend: successfully_send ? "Email Sent" : "Email not Sent",
                },
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
      const {
        officer_id,
        department_name,
        year_batch,
        start_date,
        end_date,
        selected_students,
      }: {
        officer_id: string;
        department_name: string;
        year_batch: number;
        start_date: Date;
        end_date: Date;
        selected_students: Students[];
      } = req.body;
      const company_id = tokenVerify.data;
      if (
        !officer_id ||
        !company_id ||
        !department_name ||
        !year_batch ||
        !start_date ||
        !end_date ||
        selected_students.length === 0
      ) {
        // error:
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        // confirm the company and officer is both subscribed
        const verifyOfficer = await OfficerModel.findById({ _id: officer_id });
        const verifyCompany = await CompanyModel.findById({ _id: company_id });

        // check if the end date is greater than the current date and start date is less than end date
        const currentDate = new Date();
        const endDate = new Date(end_date);
        const startDate = new Date(start_date);
        if (endDate <= currentDate || startDate > endDate) {
          return res.status(400).json({ message: "Invalid Dates" });
        } else {
          if (!verifyOfficer || !verifyCompany) {
            // error:
            return res
              .status(400)
              .json({ message: "Officer or company not found" });
          } else {
            let foundInCompany = false;
            let foundInOfficer = false;
            let foundInCompanySubscribed = false;
            // then add the data into both the schemas
            let data: selectedStudentsInterface = {
              department_name: department_name,
              year_batch: year_batch,
              end_date: end_date,
              start_date: start_date,
              confirmed: false,
              student_details: selected_students,
            };

            // add the data in officer and check if the data exist in both or not

            verifyOfficer.subscribed_company.filter((obj) => {
              if (obj.company_id === company_id) {
                foundInOfficer = true;
                if (
                  obj.selectedstudents.some((student) => {
                    return (
                      student.department_name === department_name &&
                      student.year_batch === year_batch
                    );
                  }) === false
                ) {
                  obj.selectedstudents.push(data);
                } else {
                  foundInCompanySubscribed = true;
                  return res.status(400).json({
                    message: "Data about selected students already exists",
                  });
                }
              }
            });

            if (!foundInOfficer || !foundInCompanySubscribed) {
              // add the data in company and check if the data exist in both or not
              for (const obj of verifyCompany.subscribed_officer) {
                if (obj.officer_id === officer_id) {
                  foundInCompany = true;
                  foundInCompanySubscribed = true;
                  obj.selectedstudents.push(data);
                  break; // Exit the loop after finding a match
                }
              }
              if (!foundInCompany || !foundInOfficer) {
                return res.status(400).json({
                  message: "Invalid Subscription",
                });
              } else {
                // save them
                const savedCompany = await verifyCompany.save();
                const savedOfficer = await verifyOfficer.save();

                let successfully_send = false;

                sendEmailByCompanyAction(
                  verifyOfficer,
                  verifyCompany,
                  department_name,
                  year_batch,
                  start_date,
                  end_date,
                  selected_students
                )
                  .then((response) => {
                    // Success
                    successfully_send = true;
                  })
                  .catch((error) => (successfully_send = false));
                // Success: Data set Successfully
                return res.status(200).json({
                  message: "Data set Successfully",
                  data: {
                    company: savedCompany,
                    officer: savedOfficer,
                    mailSend: successfully_send
                      ? "Email Sent"
                      : "Email not Sent",
                  },
                });
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

// get Student details by department and year_batch through company
export const getStudentDetailsbyDeptAndYearByCompany = async (
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
      const { year_batch, department_name, officer_id } = req.body;
      if (!company_id || !year_batch || !department_name || !officer_id) {
        // error:
        return res.status(400).json({ message: "Incomplete Data" });
      } else {
        // find the company
        const foundCompany = await CompanyModel.findById({ _id: company_id });
        if (!foundCompany) {
          // error:
          return res.status(400).json({ message: "Company not found" });
        } else {
          // find the year batch in the company
          const foundYearBatchInCompany = foundCompany.subscribed_officer.find(
            (e) => {
              if (e.officer_id === officer_id) {
                return e;
              }
            }
          )!;
          if (foundYearBatchInCompany.selectedbycompany === false) {
            // error:
            return res
              .status(400)
              .json({ message: "Company has not selected any student" });
          }
          const studentsInDepartment =
            foundYearBatchInCompany.selectedstudents.find((e) => {
              if (
                e.year_batch === year_batch &&
                e.department_name === department_name
              ) {
                return e;
              }
            });
          if (!studentsInDepartment) {
            // error:
            return res.status(400).json({ message: "Year Batch is not valid" });
          } else {
            // Success:
            return res.status(200).json({
              message: "This is get Students details by dept and year API",
              data: studentsInDepartment.student_details,
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

// export const getStudentDetailsbyDeptAndYear = async (
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
//       const company_id = tokenVerify.data;
//       const { officer_id, year_batch, department_name } = req.body;
//       if (!company_id || !officer_id || !year_batch || !department_name) {
//         // error:
//         return res.status(400).json({ message: "Incomplete Data" });
//       } else {
//         // find both the officer and company
//         const foundOfficer = await OfficerModel.findById({ _id: officer_id });
//         const foundCompany = await CompanyModel.findById({ _id: company_id });

//         if (!foundCompany || !foundOfficer) {
//           // error:
//           return res
//             .status(400)
//             .json({ message: "Cannot find officer or company" });
//         } else {
//           // now confirn that company have access to the data in officer side
//           let haveAccessToData = false;
//           const companySubscribedDetails =
//             foundOfficer.subscribed_company.filter((e) => {
//               if (e.company_id === company_id) {
//                 return e;
//               }
//             });

//           if (companySubscribedDetails.length === 0) {
//             // error: Company is not subscribed
//             return res
//               .status(400)
//               .json({ message: " Company is not subscribed" });
//           } else {
//             // find the year batch access is there or not for company
//             const foundYearBatchInOfficer =
//               companySubscribedDetails[0].access.filter((e) => {
//                 if (e.year_batch === year_batch) {
//                   return e;
//                 }
//               });
//             if (foundYearBatchInOfficer.length === 0) {
//               // error: Year Batch is not valid
//               return res
//                 .status(400)
//                 .json({ message: "Year Batch is not valid" });
//             } else {
//               //find if company have access for the department
//               foundYearBatchInOfficer[0].departments.filter((e) => {
//                 if (e === department_name) {
//                   haveAccessToData = true;
//                 }
//               });

//               if (haveAccessToData === false) {
//                 // error: Year Batch is not valid
//                 return res
//                   .status(400)
//                   .json({ message: "You do not have access for this data" });
//               } else {
//                 // bool for data bot found
//                 let sendData = false;
//                 foundOfficer.college_details.map((e) => {
//                   if (
//                     e.department_name === department_name &&
//                     e.year_batch == year_batch
//                   ) {
//                     //Success: if we both the department and year_batch
//                     sendData = true;

//                     return res.status(200).json({
//                       message:
//                         "This is get Students details by dept and year API",
//                       data: e,
//                     });
//                   }
//                 });
//                 // if the department does not exist in officer details.
//                 if (!sendData) {
//                   // Error:
//                   return res.status(400).json({
//                     message: "Department not exist in officer details.",
//                   });
//                 }
//               }
//             }
//           }
//         }
//       }
//     } else {
//       // error:
//       return res
//         .status(500)
//         .json({ message: "Problem in verifying the token" });
//     }
//   } catch (e) {
//     // error:
//     return res.status(500).json({ message: "Server Error" });
//   }
// };

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
        const getAllSubscribedOfficers = foundCompany.subscribed_officer;

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

export const getAllOfficerByFilterInChunks = async (
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
      const officers = await OfficerModel.find({})
        .select(
          "-college_details -subscribe_request_from_company -subscribe_request_to_company -subscribed_company -cancelled_company -password"
        )
        .exec();

      // Assuming you have retrieved the company data
      const companyData = await CompanyModel.findById({
        _id: tokenVerify.data,
      });

      if (!companyData) {
        return res.status(404).json({ message: "Company data not found." });
      }

      // Remove officers present in company data
      const filteredOfficers = officers.filter((officer) => {
        const officerId = officer._id.toString();

        // Check if the officer is present in any of the subscribe_request_from_officer data arrays
        const isSubscribeRequestFromOfficer =
          companyData.subscribe_request_from_officer.some(
            (req) => req.officer_id.toString() === officerId
          );

        //check if the officer is present in any of the subscribe_request_to_officer data arrays
        const isSubscribeRequestToOfficer =
          companyData.subscribe_request_to_officer.some(
            (req) => req.officer_id.toString() === officerId
          );

        //check if the officer is present in any of the subscribed_officer data arrays
        const isSubscribedOfficer = companyData.subscribed_officer.some(
          (sub) => sub.officer_id.toString() === officerId
        );

        return !(
          isSubscribeRequestFromOfficer ||
          isSubscribeRequestToOfficer ||
          isSubscribedOfficer
        );
      });

      // Shuffle the officers array randomly

      // Define the chunk size and total number of chunks
      const chunkSize = 7; // Number of items in each chunk
      const totalChunks = Math.ceil(filteredOfficers.length / chunkSize);

      // Get the requested chunk number from the query parameter
      const requestedChunk = parseInt(req.query.chunk as string) || 1;

      // Calculate the start and end indices of the chunk
      const startIndex = (requestedChunk - 1) * chunkSize;
      const endIndex = requestedChunk * chunkSize;

      // Slice the shuffled data array to get the desired chunk
      const chunkData = filteredOfficers.slice(startIndex, endIndex);

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
    // Error:
    return res.status(500).json("Error retrieving officers: " + error);
  }
};

export const getAllOfficerByFilterInChunksWithSearch = async (
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

      const officers = await OfficerModel.find({})
        .select(
          "-college_details -subscribe_request_from_company -subscribe_request_to_company -subscribed_company -cancelled_company -password"
        )
        .exec();

      // Assuming you have retrieved the company data
      const companyData = await CompanyModel.findById({
        _id: tokenVerify.data,
      });

      if (!companyData) {
        return res.status(404).json({ message: "Company data not found." });
      } else {
        // Filter officers based on search criteria
        const filteredOfficers = officers.filter((officer) => {
          const { username, email_id, mobile_no, college_name } = officer;
          const lowerSearch = search.toLowerCase();

          // Check if any of the officer's fields match the search query
          return (
            username.toLowerCase().includes(lowerSearch) ||
            email_id.toLowerCase().includes(lowerSearch) ||
            mobile_no.toLowerCase().includes(lowerSearch) ||
            college_name.toLowerCase().includes(lowerSearch)
          );
        });

        // Data Interface
        interface Data {
          SubscribeRequestFromOfficers: Officer[];
          SubscribeRequestToOfficers: Officer[];
          SubscribedOfficers: Officer[];
          remainingOfficers: Officer[];
        }

        // Initialize data object
        const data: Data = {
          SubscribeRequestFromOfficers: [],
          SubscribeRequestToOfficers: [],
          SubscribedOfficers: [],
          remainingOfficers: [],
        };

        // Filter officers and populate data object
        filteredOfficers.forEach((officer) => {
          const officerId = officer._id.toString();

          if (
            companyData.subscribe_request_from_officer.some(
              (req) => req.officer_id.toString() === officerId
            )
          ) {
            data.SubscribeRequestFromOfficers.push(officer);
            return; // Proceed to next iteration
          }

          if (
            companyData.subscribe_request_to_officer.some(
              (req) => req.officer_id.toString() === officerId
            )
          ) {
            data.SubscribeRequestToOfficers.push(officer);
            return; // Proceed to next iteration
          }

          if (
            companyData.subscribed_officer.some(
              (sub) => sub.officer_id.toString() === officerId
            )
          ) {
            data.SubscribedOfficers.push(officer);
            return; // Proceed to next iteration
          }

          data.remainingOfficers.push(officer);
        });

        return res.status(200).json({
          message: "Get All Filtered officers is successful",
          data: data,
        });
      }
    }
  } catch (error) {
    // Error:
    return res.status(500).json("Error retrieving officers: " + error);
  }
};
