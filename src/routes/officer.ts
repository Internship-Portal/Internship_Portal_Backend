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
  verifyToken,
  verifyOfficerByToken,
  getDepartmentDetails,
  getStudentDetailsbyDeptAndYear,
  otpEmailSendController,
  forgetPasswordController,
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
router.post("/verifyOfficerToken", verifyToken, verifyOfficerByToken);

// Create Officer Route
router.post("/createOfficer", createOfficerController);

// Get One Officer by id
router.get("/getOneOfficer/:id", verifyToken, findOfficerController);

// Get All Officers
router.get("/getAll", verifyToken, getAllOfficerController);

// Delete Officer By ID
router.delete("/deleteOfficer/:id", verifyToken, deleteOfficerController);

// Add Students details department wise, year_batch_wise
router.put("/addCollegeDetails/:id", verifyToken, addDepartmentDetails);

// Delete Students details department wise, year_batch_wise
router.put("/removeCollegeDetails/:id", verifyToken, removeDepartmentDetails);

// Add One Student Details manually
router.put("/addOneStudentDetails/:id", verifyToken, addOneStudentDetails);

// Delete One Student Details manually
router.put(
  "/deleteOneStudentDetails/:id",
  verifyToken,
  deleteOneStudentDetails
);

// Route to convert CSV To JSON
router.post("/uploadCSVOfStudents/:id", verifyToken, convertStudentsCSVtoJSON);

// Get All Departmant Details API
router.get("/getDepartmentDetails/:id", verifyToken, getDepartmentDetails);

// get One Department Details API
router.post(
  "/getStudentDetails/:id",
  verifyToken,
  upload.any(),
  getStudentDetailsbyDeptAndYear
);

// Send OTP to the email_id send
router.post("/otpEmail", otpEmailSendController);

// Set the new password by sending the token and new password
router.post("/forgetPassword", forgetPasswordController);

export default router;
