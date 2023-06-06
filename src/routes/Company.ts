import express, { Request, Response, Router } from "express";
const router: Router = Router();
import BodyParser from "body-parser";
import {
  createCompanyController,
  findCompanyController,
  deleteCompanyController,
  getAllCompanyController,
  addOfficerDetailsController,
  removeOfficerDetailsController,
} from "../controller/company";
router.use(BodyParser.json());
router.use(BodyParser.urlencoded({ extended: true }));

router.post("/createCompany", createCompanyController);
router.get("/getOneCompany/:id", findCompanyController);
router.delete("/deleteCompany/:id", deleteCompanyController);
router.post("/addOfficerDetails/:id", addOfficerDetailsController);
router.post("/removeOfficerDetails/:id", removeOfficerDetailsController);
router.get("/getAll", getAllCompanyController);

export default router;
