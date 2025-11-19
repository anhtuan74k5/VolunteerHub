// src/routes/notification.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  getMyNotifications,
  markAsRead,
} from "../controllers/notification.controller.js";

const router = express.Router();

// =============================================================================
// ROUTES THÔNG BÁO (NOTIFICATIONS)
// =============================================================================

// [GET] /api/notifications
// 🔔 Lấy danh sách thông báo
// - Chức năng: Lấy tất cả thông báo của user đang đăng nhập (sắp xếp mới nhất trước).
// - Trả về: Danh sách thông báo.
router.get("/", verifyToken, getMyNotifications);

// [PUT] /api/notifications/:id/read
// 👀 Đánh dấu đã đọc
// - Chức năng: Cập nhật trạng thái isRead = true cho một thông báo.
// - Trả về: Thông báo đã cập nhật.
router.put("/:id/read", verifyToken, markAsRead);

export default router;
