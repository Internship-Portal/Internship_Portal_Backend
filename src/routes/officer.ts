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
router.get("/getOneOfficer/:id", findOfficerController);

// Get All Officers
router.get("/getAll", getAllOfficerController);

// Delete Officer By ID
router.delete("/deleteOfficer/:id", deleteOfficerController);

// Add Students details department wise, year_batch_wise
router.put("/addCollegeDetails/:id", addDepartmentDetails);

// Delete Students details department wise, year_batch_wise
router.put("/removeCollegeDetails/:id", removeDepartmentDetails);

// Add One Student Details manually
router.put("/addOneStudentDetails/:id", addOneStudentDetails);

// Delete One Student Details manually
router.put("/deleteOneStudentDetails/:id", deleteOneStudentDetails);

// Route to convert CSV To JSON
router.post("/uploadCSVOfStudents/:id", convertStudentsCSVtoJSON);

// Get All Departmant Details API
router.get("/getDepartmentDetails/:id", getDepartmentDetails);

// get One Department Details API
router.post(
  "/getStudentDetails/:id",
  upload.any(),
  getStudentDetailsbyDeptAndYear
);

// Send OTP to the email_id send
router.post("/otpEmail", otpEmailSendController);

// Set the new password by sending the token and new password
router.post("/forgetPassword", forgetPasswordController);

// cancle request of company
router.put("/addCancelledRequest", addCancelledRequest);

// add Request from officer to company
router.post("/addSubscribeRequestToCompany", addSubscribeRequestToCompany);

// add subscription to the Officers
router.put("/addSubscribedOfficerFromOfficer", addSubscribedOfficerFromOfficer);

// give access to companies by passing access and company_id
router.put("/giveAccessToCompanies", giveAccessToCompanies);

export default router;
