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
  getdepartmentNotSelectedByCompany,
  addCancelledRequest,
  setMessage,
  getMessage,
  addCancelledRequestByCompany,
  getStudentDetailsbyDeptAndYearByCompany,
  getAllSubscribedOfficers,
  getAllCancelledRequests,
  getAllRequestsbyCompany,
  getAllRequestedOfficers,
  getAllOfficerByFilterInChunks,
  getAllOfficerByFilterInChunksWithSearch,
  selectedStudentsByCompaniesWithoutDates,
  selectedStudentsByCompaniesWithDates,
  // verifyCompanyTwoStepValidation,
} from "../controller/company";
import {
  createCompanyControllerMiddleware,
  normalMiddleware,
  loginCompanyControllerMiddleware,
  addSubscribeRequestToOfficerMiddleware,
  addSubscribedOfficerFromCompanyMiddleware,
  selectedStudentsByCompaniesWithoutDatesMiddleware,
  selectedStudentsByCompaniesWithDatesMiddleware,
  getdepartmentNotSelectedByCompanyMiddleware,
  getStudentDetailsbyDeptAndYearByCompanyMiddleware,
  setMessageMiddleware,
  getAllOfficerByFilterInChunksWithSearchMiddleware,
} from "../middleware/company";

// Routes connected to the controllers companies function

// login company route
router.post(
  "/loginCompany",
  loginCompanyControllerMiddleware,
  loginCompanyController
);

// verify the token from frontend ROute
// router.post("/verifyCompanyTwoStepValidation", verifyCompanyTwoStepValidation);

// verify the token from frontend ROute
router.post("/verifyCompanyToken", normalMiddleware, verifyCompanyByToken);

// Create Company Route
router.post(
  "/createCompany",
  createCompanyControllerMiddleware,
  createCompanyController
);

// Get All Companies
router.get("/getAll", normalMiddleware, getAllCompanyController);

// Delete Company by Id
router.delete("/deleteCompany", normalMiddleware, deleteCompanyController);

// get department not selected by company
router.put(
  "/getdepartmentNotSelectedByCompany",
  getdepartmentNotSelectedByCompanyMiddleware,
  getdepartmentNotSelectedByCompany
);

// subscribe the officer
router.post(
  "/addSubscribeRequestToOfficer",
  addSubscribeRequestToOfficerMiddleware,
  addSubscribeRequestToOfficer
);

// remove officer details from the request schema where company accept the request
router.put(
  "/addSubscribedOfficerFromCompany",
  addSubscribedOfficerFromCompanyMiddleware,
  addSubscribedOfficerFromCompany
);

// cancle request of officer
router.put(
  "/addCancelledRequest",
  addSubscribedOfficerFromCompanyMiddleware,
  addCancelledRequest
);

// cancle request to officer
router.put(
  "/addCancelledRequestByCompany",
  addSubscribedOfficerFromCompanyMiddleware,
  addCancelledRequestByCompany
);

// get Officer Details
router.put(
  "/getStudentDetailsbyDeptAndYear",
  getStudentDetailsbyDeptAndYearByCompanyMiddleware,
  getStudentDetailsbyDeptAndYearByCompany
);

// get All Subscribed Officers
router.get(
  "/getAllSubscribedOfficers",
  normalMiddleware,
  getAllSubscribedOfficers
);

// get All Cancelled Requests
router.get(
  "/getAllCancelledRequests",
  normalMiddleware,
  getAllCancelledRequests
);

// get All Requests by Company
router.get(
  "/getAllRequestsbyCompany",
  normalMiddleware,
  getAllRequestsbyCompany
);

// get All Requested Officers
router.get(
  "/getAllRequestedOfficers",
  normalMiddleware,
  getAllRequestedOfficers
);

// get All Officers filtered with respect to AllSubscribedOfficers, AllRequestsbyCompany, AllRequestedOfficers
router.get(
  "/getAllOfficerByFilterInChunks",
  normalMiddleware,
  getAllOfficerByFilterInChunks
);

// get Searched Officers with respect to AllSubscribedOfficers, AllRequestsbyCompany, AllRequestedOfficers
router.post(
  "/getOfficersBySearch",
  getAllOfficerByFilterInChunksWithSearchMiddleware,
  getAllOfficerByFilterInChunksWithSearch
);

// get Searched Officers with respect to AllSubscribedOfficers, AllRequestsbyCompany, AllRequestedOfficers
router.put(
  "/setSelectedStudentsWithoutDates",
  selectedStudentsByCompaniesWithoutDatesMiddleware,
  selectedStudentsByCompaniesWithoutDates
);

// get Searched Officers with respect to AllSubscribedOfficers, AllRequestsbyCompany, AllRequestedOfficers
router.put(
  "/setSelectedStudentsWithDates",
  selectedStudentsByCompaniesWithDatesMiddleware,
  selectedStudentsByCompaniesWithDates
);

// set message
router.put("/setMessage", setMessageMiddleware, setMessage);

// get message
router.post(
  "/getMessage",
  getdepartmentNotSelectedByCompanyMiddleware,
  getMessage
);

export default router;
