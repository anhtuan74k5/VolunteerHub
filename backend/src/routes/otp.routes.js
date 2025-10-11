import { Router } from "express";
import {
  sendRegisterOtp,
  verifyRegisterOtp,
  sendResetOtp,
  resetPassword,
} from "../controllers/otp.controller.js";

const router = Router();

// 📩 Đăng ký OTP
router.post("/register/send-otp", sendRegisterOtp);
router.post("/register/verify-otp", verifyRegisterOtp);

// 🔑 Quên mật khẩu
router.post("/reset/send-otp", sendResetOtp);
router.post("/reset/verify", resetPassword);

export default router;
