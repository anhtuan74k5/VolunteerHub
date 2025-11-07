import { Router } from "express";
import {
  // Đăng ký
  sendRegisterOtp,
  verifyAndRegister,
  // Đăng nhập
  login,
  // Hồ sơ
  getMe,
  updateProfile,
  changePassword,
  // Quên mật khẩu
  sendResetOtp,
  resetPassword,
  // Admin
  getAllUsers,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// --- Đăng ký ---
router.post("/register/send-otp", sendRegisterOtp);
router.post("/register/verify", verifyAndRegister); // Đổi tên từ verify-otp

// --- Đăng nhập ---
router.post("/login", login);

// --- Quên mật khẩu ---
router.post("/reset/send-otp", sendResetOtp);
router.post("/reset/verify", resetPassword);

// --- Quản lý hồ sơ (Cần đăng nhập) ---
router.get("/me", verifyToken, getMe);
router.put("/update", verifyToken, updateProfile);
router.put("/change-password", verifyToken, changePassword);

// --- Admin (Cần đăng nhập + quyền Admin) ---
router.get("/all", verifyToken, getAllUsers); // Bạn có thể thêm middleware admin ở đây nếu muốn

export default router;