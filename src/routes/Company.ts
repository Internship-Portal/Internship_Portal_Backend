import express, { Request, Response, Router } from "express";
const router: Router = Router();
import {
  createCompanyController,
  deleteCompanyController,
  getAllCompanyController,
  verifyCompanyByToken,
  loginCompanyController,
  addSubscribeRequestToOfficer,
  addSubscribedOfficerFromCompany,
  addCancelledRequest,
  getStudentDetailsbyDeptAndYear,
  getAllSubscribedOfficers,
  getAllCancelledRequests,
  getAllRequestsbyCompany,
  getAllRequestedOfficers,
  getAllOfficerByFilterInChunks,
  getAllOfficerByFilterInChunksWithSearch,
  selectedStudentsByCompaniesWithoutDates,
  selectedStudentsByCompaniesWithDates,
  verifyCompanyTwoStepValidation,
} from "../controller/company";

// Routes connected to the controllers companies function

// login company route
router.post("/loginCompany", loginCompanyController);

// verify the token from frontend ROute
router.post("/verifyCompanyTwoStepValidation", verifyCompanyTwoStepValidation);

// verify the token from frontend ROute
router.post("/verifyCompanyToken", verifyCompanyByToken);

// Create Company Route
router.post("/createCompany", createCompanyController);

// Get All Companies
router.get("/getAll", getAllCompanyController);

// Delete Company by Id
router.delete("/deleteCompany", deleteCompanyController);

// Check the below routes

// subscribe the officer
router.post("/addSubscribeRequestToOfficer", addSubscribeRequestToOfficer);

// remove officer details from the request schema where company accept the request
router.put("/addSubscribedOfficerFromCompany", addSubscribedOfficerFromCompany);

// cancle request of officer
router.put("/addCancelledRequest", addCancelledRequest);

// get Officer Details
router.put("/getStudentDetailsbyDeptAndYear", getStudentDetailsbyDeptAndYear);

// get All Subscribed Officers
router.get("/getAllSubscribedOfficers", getAllSubscribedOfficers);

// get All Cancelled Requests
router.get("/getAllCancelledRequests", getAllCancelledRequests);

// get All Requests by Company
router.get("/getAllRequestsbyCompany", getAllRequestsbyCompany);

// get All Requested Officers
router.get("/getAllRequestedOfficers", getAllRequestedOfficers);

// get All Officers filtered with respect to AllSubscribedOfficers, AllRequestsbyCompany, AllRequestedOfficers
router.get("/getAllOfficerByFilterInChunks", getAllOfficerByFilterInChunks);

// get Searched Officers with respect to AllSubscribedOfficers, AllRequestsbyCompany, AllRequestedOfficers
router.post("/getOfficersBySearch", getAllOfficerByFilterInChunksWithSearch);

// get Searched Officers with respect to AllSubscribedOfficers, AllRequestsbyCompany, AllRequestedOfficers
router.put(
  "/setSelectedStudentsWithoutDates",
  selectedStudentsByCompaniesWithoutDates
);

// get Searched Officers with respect to AllSubscribedOfficers, AllRequestsbyCompany, AllRequestedOfficers
router.put(
  "/setSelectedStudentsWithDates",
  selectedStudentsByCompaniesWithDates
);

export default router;
