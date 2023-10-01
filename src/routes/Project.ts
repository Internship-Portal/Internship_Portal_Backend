import { Router } from "express";

import {
  checkUniqueTitleMiddleware,
  createProjectStep1Middleware,
  createProjectStep2Middleware,
  getOneProjectMiddleware,
  getProjectFiltersMiddleware,
  closeProjectBiddingMiddleware,
} from "../middleware/Project";

import {
  checkUniqueTitleController,
  createProjectStep1Controller,
  createProjectStep2Controller,
  getProjectByFiltersController,
  getProjectByIdController,
  closeBiddingController,
} from "../controller/Project";
const router: Router = Router();

router.post(
  "/createProjectStep1",
  createProjectStep1Middleware,
  createProjectStep1Controller
);

router.post(
  "/createProjectStep2",
  createProjectStep2Middleware,
  createProjectStep2Controller
);

router.post(
  "/checkUniqueTitle",
  checkUniqueTitleMiddleware,
  checkUniqueTitleController
);

router.post(`/getProject`, getOneProjectMiddleware, getProjectByIdController);

router.post(
  `/getProjectFilter`,
  getProjectFiltersMiddleware,
  getProjectByFiltersController
);

router.put(
  `/closeBidding`,
  closeProjectBiddingMiddleware,
  closeBiddingController
);

export default router;
