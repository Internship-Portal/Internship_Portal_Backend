import express, { Request, Response, Router } from "express";
const router: Router = Router();
import {
  createCompanyController,
  findCompanyController,
  deleteCompanyController,
  getAllCompanyController,
  verifyCompanyByToken,
  loginCompanyController,
  otpEmailSendController,
  forgetPasswordController,
  addSubscribeRequestToOfficer,
  addSubscribedOfficerFromCompany,
  addCancelledRequest,
  getStudentDetailsbyDeptAndYear,
} from "../controller/company";

// Routes connected to the controllers companies function

// login company route
router.post("/loginCompany", loginCompanyController);

// verify the token from frontend ROute
router.post("/verifyCompanyToken", verifyCompanyByToken);

// Create Company Route
router.post("/createCompany", createCompanyController);

// Get One Company by Id
router.get("/getOneCompany/:id", findCompanyController);

// Get All Companies
router.get("/getAll", getAllCompanyController);

// Delete Company by Id
router.delete("/deleteCompany/:id", deleteCompanyController);

// Send OTP to the email_id send
router.post("/otpEmail", otpEmailSendController);

// Set the new password by sending the token and new password
router.post("/forgetPassword", forgetPasswordController);

// subscribe the officer
router.post("/addSubscribeRequestToOfficer", addSubscribeRequestToOfficer);

// remove officer details from the request schema where company accept the request
router.put("/addSubscribedOfficerFromCompany", addSubscribedOfficerFromCompany);

// cancle request of officer
router.put("/addCancelledRequest", addCancelledRequest);

// get Officer Details
router.put("/getStudentDetailsbyDeptAndYear", getStudentDetailsbyDeptAndYear);

export default router;
