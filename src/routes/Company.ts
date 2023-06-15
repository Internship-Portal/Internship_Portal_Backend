import express, { Request, Response, Router } from "express";
const router: Router = Router();
import BodyParser from "body-parser";
import {
  createCompanyController,
  findCompanyController,
  deleteCompanyController,
  getAllCompanyController,
  verifyCompanyByToken,
  loginCompanyController,
} from "../controller/company";
router.use(BodyParser.json());
router.use(BodyParser.urlencoded({ extended: true }));

// Routes connected to the controllers companies function

// login company route
router.post("/loginCompany", loginCompanyController);

// Create Company Route
router.post("/createCompany", createCompanyController);

// Get One Company by Id
router.get("/getOneCompany/:id", findCompanyController);

// Get All Companies
router.get("/getAll", getAllCompanyController);

// Delete Company by Id
router.delete("/deleteCompany/:id", deleteCompanyController);

export default router;
