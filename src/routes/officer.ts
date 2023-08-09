import { Router } from "express";
const router: Router = Router();
import multer from "multer";

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
  verifyOfficerByToken,
  getDepartmentDetails,
  getStudentDetailsbyDeptAndYear,
  addCancelledRequest,
  addSubscribeRequestToCompany,
  addSubscribedOfficerFromOfficer,
  getAllRequestedCompanies,
  getAllSubscribedCompanies,
  getAllRequestsbyOfficer,
  getAllCompanyByFilter,
  getAllCancelledRequests,
  getAllCompaniesByFilterInChunksWithSearch,
  getStudentDetailsbyDeptAndYearSeparatedAvaiability,
  addCancelledRequestByOfficer,
  getAllSelectedStudentsByCompanies,
  getCollegeDepartmentAndYears,
  confirmSelectedStudentsWithNoDateProvided,
  giveEmailToCompanyAndOfficerRegardingAccess,
  getAllStudentsAccordingToAchievementsAndSkills,
  confirmSelectedStudentsWithDates,
  getMessage,
  sendMoreStudentDetails,
} from "../controller/officer";

import {
  loginOfficerMiddleware,
  verifyOfficerTokenMiddleware,
  normalMiddleware,
  createOfficerMiddleware,
  addDepartmentDetailsMiddleware,
  removeDepartmentDetailsMiddleware,
  addOneStudentDetailsMiddleware,
  deleteOneStudentDetailsMiddleware,
  convertStudentsCSVtoJSONMiddleware,
  getStudentDetailsbyDeptAndYearMiddleware,
  addCancelledRequestMiddleware,
  addSubscribeRequestToCompanyMiddleware,
  confirmSelectedStudentsWithDatesMiddlware,
  confirmSelectedStudentsWithNoDateProvidedMiddleware,
  getAllCompaniesByFilterInChunksWithSearchMiddleware,
  getAllSelectedStudentsByCompaniesMiddleware,
  getAllStudentsAccordingToAchievementsAndSkillsMiddleware,
  sendMoreStudentDetailsMiddleware,
  getMessageMiddleware,
} from "../middleware/officer";

// Set up multer storage
const storage = multer({ dest: "uploads/" });

// Set up multer upload middleware
const upload = multer();

// Routes connected to the controllers officers function

// Login Officer Route
router.post("/loginOfficer", loginOfficerMiddleware, loginOfficerController);

// verify the token from frontend ROute
// router.post("/verifyOfficerTwoStepToken", verifyOfficerTwoStepValidation);

// verify the token from frontend ROute
router.post(
  "/verifyOfficerToken",
  verifyOfficerTokenMiddleware,
  verifyOfficerByToken
);

// Create Officer Route
router.post("/createOfficer", createOfficerMiddleware, createOfficerController);

// Get One Officer by id
router.get("/getOneOfficer", normalMiddleware, findOfficerController);

// Get All Officers
router.get("/getAll", normalMiddleware, getAllOfficerController);

// Delete Officer By ID
router.delete("/deleteOfficer", normalMiddleware, deleteOfficerController);

// Add Students details department wise, year_batch_wise
router.put(
  "/addCollegeDetails",
  addDepartmentDetailsMiddleware,
  addDepartmentDetails
);

// Delete Students details department wise, year_batch_wise
router.put(
  "/removeCollegeDetails",
  removeDepartmentDetailsMiddleware,
  removeDepartmentDetails
);

// Add One Student Details manually
router.put(
  "/addOneStudentDetails",
  addOneStudentDetailsMiddleware,
  addOneStudentDetails
);

// Delete One Student Details manually
router.put(
  "/deleteOneStudentDetails",
  deleteOneStudentDetailsMiddleware,
  deleteOneStudentDetails
);

// Route to convert CSV To JSON
router.post(
  "/uploadCSVOfStudents",
  convertStudentsCSVtoJSONMiddleware,
  convertStudentsCSVtoJSON
);

// Get All Departmant Details API
router.get("/getDepartmentDetails", normalMiddleware, getDepartmentDetails);

// get One Department Details API
router.post(
  "/getStudentDetails",
  upload.any(),
  getStudentDetailsbyDeptAndYearMiddleware,
  getStudentDetailsbyDeptAndYear
);

// cancle request of company
router.put(
  "/addCancelledRequest",
  addCancelledRequestMiddleware,
  addCancelledRequest
);

// cancle request by officer
router.put(
  "/addCancelledRequestByOfficer",
  addCancelledRequestMiddleware,
  addCancelledRequestByOfficer
);

// add Request from officer to company
router.post(
  "/addSubscribeRequestToCompany",
  addSubscribeRequestToCompanyMiddleware,
  addSubscribeRequestToCompany
);

// add subscription to the Officers
router.put(
  "/addSubscribedOfficerFromOfficer",
  addCancelledRequestMiddleware,
  addSubscribedOfficerFromOfficer
);

// give access to companies by passing access and company_id
// router.put("/giveAccessToCompanies", giveAccessToCompanies);

// get All Requested companies details
router.get(
  "/getAllRequestedCompanies",
  normalMiddleware,
  getAllRequestedCompanies
);

// get All Subscribed companies details
router.get(
  "/getAllRequestsbyOfficer",
  normalMiddleware,
  getAllRequestsbyOfficer
);

// get All cancelled companies
router.get(
  "/getAllCancelledRequests",
  normalMiddleware,
  getAllCancelledRequests
);

// get All subscribed Companies
router.get(
  "/getAllSubscribedCompanies",
  normalMiddleware,
  getAllSubscribedCompanies
);

// get All Officers filtered with respect to AllSubscribedOfficers, AllRequestsbyCompany, AllRequestedOfficers
router.get("/getAllCompanyByFilter", normalMiddleware, getAllCompanyByFilter);

// get Department and year list for access in officer
router.get(
  "/getCollegeDepartmentAndYears",
  normalMiddleware,
  getCollegeDepartmentAndYears
);

// get Searched Companies with respect to AllSubscribedOfficers, AllRequestsbyCompany, AllRequestedOfficers
router.post(
  "/getCompaniesBySearch",
  getAllCompaniesByFilterInChunksWithSearchMiddleware,
  getAllCompaniesByFilterInChunksWithSearch
);

// get All available and unavailable students
router.post(
  "/getStudentDetailsbyDeptAndYearSeparatedAvaiability",
  getStudentDetailsbyDeptAndYearMiddleware,
  getStudentDetailsbyDeptAndYearSeparatedAvaiability
);

// get All selected students by companies
router.post(
  "/getAllSelectedStudentsByCompanies",
  getAllSelectedStudentsByCompaniesMiddleware,
  getAllSelectedStudentsByCompanies
);

// make selected students unavailable without Dates
router.put(
  "/confirmSelectedStudentsWithNoDateProvided",
  confirmSelectedStudentsWithNoDateProvidedMiddleware,
  confirmSelectedStudentsWithNoDateProvided
);

// make selected students unavailable with Dates
router.put(
  "/confirmSelectedStudentsWithDates",
  confirmSelectedStudentsWithDatesMiddlware,
  confirmSelectedStudentsWithDates
);

// send email to company and officer regarding Access
// router.put(
//   "/giveEmailToCompanyAndOfficerRegardingAccess",
//   giveEmailToCompanyAndOfficerRegardingAccess
// );

router.put(
  "/getSearchStudents",
  getAllStudentsAccordingToAchievementsAndSkillsMiddleware,
  getAllStudentsAccordingToAchievementsAndSkills
);

router.put(
  "/setMoreStudentInCompany",
  sendMoreStudentDetailsMiddleware,
  sendMoreStudentDetails
);

router.post("/getMessage", getMessageMiddleware, getMessage);

export default router;
