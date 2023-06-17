import express, { NextFunction, Request, Response, Router } from "express";
const router: Router = Router();

import BodyParser from "body-parser";
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
} from "../controller/officer";

router.use(BodyParser.json());
router.use(BodyParser.urlencoded({ extended: true }));
// const upload = multer({ dest: "uploads/" });

// Routes connected to the controllers officers function

// Login Officer Route
router.post("/loginOfficer", loginOfficerController);

// verify the token from frontend ROute
router.post("/verifyOfficerToken", verifyToken, verifyOfficerByToken);

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

// Get Student Details API
router.get("/getDepartmentDetails/:id", getDepartmentDetails);

export default router;
