import express, { Request, Response, Router } from "express";
const router: Router = Router();
import BodyParser from "body-parser";
import {
  createOfficerController,
  findOfficerController,
  deleteOfficerController,
  getAllOfficerController,
  addDepartmentDetails,
  removeDepartmentDetails,
} from "../controller/officer";
router.use(BodyParser.json());
router.use(BodyParser.urlencoded({ extended: true }));

// Routes connected to the controllers officers function

// Create Officer Route
router.post("/createOfficer", createOfficerController);

// Get One Officer by id
router.get("/getOneOfficer/:id", findOfficerController);

// Get All Officers
router.get("/getAll", getAllOfficerController);

// Delete Officer By ID
router.delete("/deleteOfficer/:id", deleteOfficerController);

// Add Students details department wise, year_batch_wise
router.post("/addCollegeDetails/:id", addDepartmentDetails);

// Delete Students details department wise, year_batch_wise
router.post("/removeCollegeDetails/:id", removeDepartmentDetails);

export default router;
