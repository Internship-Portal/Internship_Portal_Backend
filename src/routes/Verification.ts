import { Router } from "express";
const router: Router = Router();

import {
  sendVerificationEmailController,
  verifyEmailController,
} from "../controller/Verification";

import {
  sendVerificationEmailMiddleware,
  verifyEmailMiddleware,
} from "../middleware/Verification";

router.post(
  "/sendVerificationEmail",
  sendVerificationEmailMiddleware,
  sendVerificationEmailController
);

router.post("/verifyEmail", verifyEmailMiddleware, verifyEmailController);

export default router;
