import express from "express";
import {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  sendOTP,
  verifyOTP,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { validate, authValidation } from "../middleware/validation.js";

const router = express.Router();

// Public routes
router.post("/register", validate(authValidation.register), register);
router.post("/login", validate(authValidation.login), login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Protected routes
router.use(authenticate);
router.get("/me", getMe);
router.post("/logout", logout);
router.put("/update-password", updatePassword);

export default router;
