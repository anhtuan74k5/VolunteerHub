import { Router } from "express";
import {
  login,
  getMe,
  updateProfile,
  getAllUsers,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.js";

const router = Router();

// 🔑 Đăng nhập
router.post("/login", login);

// 👤 Lấy thông tin người dùng hiện tại
router.get("/me", verifyToken, getMe);

// ✏️ Cập nhật hồ sơ người dùng
router.put("/update", verifyToken, updateProfile);

// 👥 Lấy danh sách tất cả người dùng (Admin)
router.get("/all", verifyToken, getAllUsers);

export default router;
