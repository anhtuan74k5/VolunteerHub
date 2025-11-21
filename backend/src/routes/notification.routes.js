// src/routes/notification.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  getMyNotifications,
  markAsRead,
  saveSubscription,
  getVapidPublicKey,
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

// 👇 THÊM ROUTE MỚI
// [POST] /api/notifications/subscribe
// 📥 Lưu subscription từ trình duyệt
router.post("/subscribe", verifyToken, saveSubscription);

// [GET] /api/notifications/vapidPublicKey
// Trả về public VAPID key (dành cho frontend khi không có env var tại build time)
router.get("/vapidPublicKey", getVapidPublicKey);

// --------- TEMP TEST ROUTES (LOCAL ONLY) ----------
// Temporary test routes removed — keep production routes minimal and secure.

export default router;
