import express, { NextFunction, Request, Response, Router } from "express";
const router: Router = Router();
import multer from "multer";
import {
  createOfficerController,
  findOfficerController,
  deleteOfficerController,
  getAllOfficerController,
  addDepartmentDetails,
  removeDepartmentDetails,
  addOneStudentDetails,
  deleteOneStudentDetails,
  convertStudentsCSVtoJSON,
  loginOfficerController,
  verifyOfficerByToken,
  getDepartmentDetails,
  getStudentDetailsbyDeptAndYear,
  otpEmailSendController,
  forgetPasswordController,
  addCancelledRequest,
  addSubscribeRequestToCompany,
  addSubscribedOfficerFromOfficer,
  giveAccessToCompanies,
  getAllRequestedCompanies,
  getAllSubscribedCompanies,
  getAllRequestsbyOfficer,
  getAllCompanyByFilter,
  getAllCancelledRequests,
} from "../controller/officer";

// Set up multer storage
const storage = multer({ dest: "uploads/" });

// Set up multer upload middleware
const upload = multer();

// const upload = multer({ dest: "uploads/" });

// Routes connected to the controllers officers function

// Login Officer Route
router.post("/loginOfficer", loginOfficerController);

// verify the token from frontend ROute
router.post("/verifyOfficerToken", verifyOfficerByToken);

// Create Officer Route
router.post("/createOfficer", createOfficerController);

// Get One Officer by id
router.get("/getOneOfficer", findOfficerController);

// Get All Officers
router.get("/getAll", getAllOfficerController);

// Delete Officer By ID
router.delete("/deleteOfficer", deleteOfficerController);

// Add Students details department wise, year_batch_wise
router.put("/addCollegeDetails", addDepartmentDetails);

// Delete Students details department wise, year_batch_wise
router.put("/removeCollegeDetails", removeDepartmentDetails);

// Add One Student Details manually
router.put("/addOneStudentDetails", addOneStudentDetails);

// Delete One Student Details manually
router.put("/deleteOneStudentDetails", deleteOneStudentDetails);

// Route to convert CSV To JSON
router.post("/uploadCSVOfStudents", convertStudentsCSVtoJSON);

// Get All Departmant Details API
router.get("/getDepartmentDetails", getDepartmentDetails);

// get One Department Details API
router.post("/getStudentDetails", upload.any(), getStudentDetailsbyDeptAndYear);

// Send OTP to the email_id send
router.post("/otpEmail", otpEmailSendController);

// Set the new password by sending the token and new password
router.post("/forgetPassword", forgetPasswordController);

// Remanining Check the below routes

// cancle request of company
router.put("/addCancelledRequest", addCancelledRequest);

// add Request from officer to company
router.post("/addSubscribeRequestToCompany", addSubscribeRequestToCompany);

// add subscription to the Officers
router.put("/addSubscribedOfficerFromOfficer", addSubscribedOfficerFromOfficer);

// give access to companies by passing access and company_id
router.put("/giveAccessToCompanies", giveAccessToCompanies);

// get All Requested companies details
router.get("/getAllRequestedCompanies", getAllRequestedCompanies);

// get All Subscribed companies details
router.get("/getAllRequestsbyOfficer", getAllRequestsbyOfficer);

// get All cancelled companies
router.get("/getAllCancelledRequests", getAllCancelledRequests);

// get All subscribed Companies
router.get("/getAllSubscribedCompanies", getAllSubscribedCompanies);

// get All Officers filtered with respect to AllSubscribedOfficers, AllRequestsbyCompany, AllRequestedOfficers
router.get("/getAllCompanyByFilter", getAllCompanyByFilter);

export default router;
