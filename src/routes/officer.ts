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
router.post("/createOfficer", createOfficerController);
router.get("/getOneOfficer/:id", findOfficerController);
router.get("/getAll", getAllOfficerController);
router.delete("/deleteOfficer/:id", deleteOfficerController);
router.post("/addCollegeDetails/:id", addDepartmentDetails);
router.post("/removeCollegeDetails/:id", removeDepartmentDetails);

export default router;
