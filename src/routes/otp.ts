import { Router } from "express";
const router: Router = Router();

import { sendOTP, verifyOTP, changePassword } from "../controller/otp";

// Send OTP Route
router.post("/sendOTP", sendOTP);

// Verify OTP Route
router.post("/verifyOTP", verifyOTP);

// Change Password Route
router.post("/changePassword", changePassword);

export default router;
