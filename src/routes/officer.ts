import express, { Request, Response, Router } from "express";
const router: Router = Router();
import BodyParser from "body-parser";
import {
  createOfficerController,
  findOfficerController,
  deleteOfficerController,
  getAllOfficerController,
  addCompanySharedDetails,
  removeCompanySharedDetails,
  addCollegeDetails,
  removeCollegeDetails,
} from "../controller/officer";
router.use(BodyParser.json());
router.use(BodyParser.urlencoded({ extended: true }));

router.post("/createOfficer", createOfficerController);
router.get("/getOneOfficer/:id", findOfficerController);
router.get("/getAll", getAllOfficerController);
router.delete("/deleteOfficer/:id", deleteOfficerController);
router.post("/addCollegeDetails/:id", addCollegeDetails);
router.post("/removeCollegeDetails/:id", removeCollegeDetails);
router.post("/addCompanyShared/:id", addCompanySharedDetails);
router.post("/removeCompanyShared/:id", removeCompanySharedDetails);

export default router;
