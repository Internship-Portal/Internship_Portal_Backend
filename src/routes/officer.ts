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
} from "../controller/officer";
router.use(BodyParser.json());
router.use(BodyParser.urlencoded({ extended: true }));

router.post("/createOfficer", createOfficerController);
router.get("/getOneOfficer/:id", findOfficerController);
router.get("/getAll", getAllOfficerController);
router.delete("/deleteOfficer/:id", deleteOfficerController);
router.post("/addCompanyShared/:id", addCompanySharedDetails);
router.delete("/removeCompanyShared/:id", removeCompanySharedDetails);

export default router;
