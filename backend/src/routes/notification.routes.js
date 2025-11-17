// src/routes/notification.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  getMyNotifications,
  markAsRead,
  subscribe,
} from "../controllers/notification.controller.js";

const router = express.Router();

// =================================================================================================
// Routes cho Thông báo (Yêu cầu xác thực token)
// =================================================================================================

// [GET] /api/notifications
// 📬 Lấy tất cả thông báo của người dùng đang đăng nhập
router.get("/", verifyToken, getMyNotifications);

// [PUT] /api/notifications/:id/read
// ✔️ Đánh dấu một thông báo cụ thể là đã đọc
router.put("/:id/read", verifyToken, markAsRead);

router.post("/subscribe", verifyToken, subscribe);
export default router;
