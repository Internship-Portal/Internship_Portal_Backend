import { Router } from "express";
const router: Router = Router();

import {
  sendOTP,
  verifyOTP,
  changePassword,
  verifyEmailOTP,
  verifyOTPValidation,
} from "../controller/otp";

// Send OTP Route
router.post("/sendOTP", sendOTP);

// Verify OTP Route
router.post("/verifyOTP", verifyOTP);

// Verify Email OTP Route
router.post("/verifyEmailOTP", verifyEmailOTP);

// Verify OTP Validation Route
router.post("/verifyOTPValidation", verifyOTPValidation);

// Change Password Route
router.post("/changePassword", changePassword);

export default router;
