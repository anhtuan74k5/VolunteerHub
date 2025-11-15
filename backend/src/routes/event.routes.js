// src/routes/event.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import { eventManager } from "../middlewares/auth.js";
import { uploadEventImages } from "../middlewares/upload.js";
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getApprovedEvents,
  getEventDetails,
  getMyEvents,
  completeEvent,
  getEventParticipantss,
} from "../controllers/event.controller.js";

const router = express.Router();

// --- PUBLIC ROUTES (Không cần đăng nhập) ---
// --- PUBLIC ROUTES (Không cần đăng nhập) ---

// [GET] /api/events/public
// Lấy danh sách tất cả sự kiện đã được duyệt (cho người xem công khai)
router.get("/public", getApprovedEvents);

// [GET] /api/events/public/:id
// Lấy chi tiết một sự kiện công khai (theo ID)
router.get("/public/:id", getEventDetails);

// --- PRIVATE ROUTES (Yêu cầu quyền Event Manager) ---
// Áp dụng middleware cho các route cần quyền Event Manager

// [GET] /api/events/my-events
// Lấy danh sách các sự kiện do chính manager đang đăng nhập tạo ra
router.get("/my-events", verifyToken, eventManager, getMyEvents);

// [POST] /api/events/
// Tạo một sự kiện mới (manager tạo, chờ admin duyệt)
// (uploadEventImages: middleware xử lý upload ảnh)
router.post("/", verifyToken, eventManager, uploadEventImages, createEvent);

// [PUT] /api/events/:id
// Cập nhật một sự kiện (manager chỉ có thể sửa sự kiện của mình)
// (uploadEventImages: middleware xử lý upload ảnh *mới* nếu có)
router.put("/:id", verifyToken, eventManager, uploadEventImages, updateEvent);

// [DELETE] /api/events/:id
// Xóa một sự kiện (manager chỉ có thể xóa sự kiện của mình)
router.delete("/:id", verifyToken, eventManager, deleteEvent);

// [PUT] /api/events/:id/complete
// Đánh dấu một sự kiện là đã hoàn thành
router.put("/:id/complete", verifyToken, eventManager, completeEvent);

// [GET] /api/events/public/:id/participants
// Lấy danh sách (công khai) những ai đã được duyệt tham gia
router.get("/public/:id/participants", getEventParticipants);

export default router;
