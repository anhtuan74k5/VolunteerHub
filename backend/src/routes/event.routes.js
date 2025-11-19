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
  getEventParticipants,
  getEventDetailsForManagement,
} from "../controllers/event.controller.js";

const router = express.Router();

// =============================================================================
// ROUTES QUẢN LÝ SỰ KIỆN (EVENTS)
// =============================================================================

// --- PUBLIC ROUTES (Ai cũng xem được) ---

// [GET] /api/events/public
// 🌍 Lấy danh sách sự kiện công khai
// - Chức năng: Lấy danh sách các sự kiện đã được duyệt (APPROVED) và chưa kết thúc.
// - Trả về: Danh sách sự kiện (có phân trang, lọc).
router.get("/public", getApprovedEvents);

// [GET] /api/events/public/:id
// ℹ️ Chi tiết sự kiện
// - Chức năng: Xem thông tin chi tiết của một sự kiện cụ thể.
// - Trả về: Object Event chi tiết.
router.get("/public/:id", getEventDetails);

// [GET] /api/events/public/:id/participants
// 👥 Danh sách người tham gia (Công khai)
// - Chức năng: Xem danh sách những người đã được duyệt tham gia sự kiện này.
// - Trả về: Danh sách user (tên, avatar).
router.get("/public/:id/participants", getEventParticipants);

// --- MANAGER ROUTES (Yêu cầu quyền Event Manager) ---

// [GET] /api/events/my-events
// 📂 Sự kiện của tôi
// - Chức năng: Manager xem danh sách các sự kiện do chính mình tạo ra.
// - Trả về: Danh sách sự kiện của manager.
router.get("/my-events", verifyToken, eventManager, getMyEvents);

// [POST] /api/events/
// ➕ Tạo sự kiện mới
// - Chức năng: Manager tạo sự kiện mới (trạng thái ban đầu là PENDING).
// - Body yêu cầu: Form-data (title, description, date, location, images...).
// - Trả về: Sự kiện vừa tạo.
router.post("/", verifyToken, eventManager, uploadEventImages, createEvent);

// [PUT] /api/events/:id
// ✏️ Cập nhật sự kiện
// - Chức năng: Sửa thông tin sự kiện (chỉ sửa được khi chưa diễn ra hoặc tùy logic).
// - Body yêu cầu: Form-data (các trường cần sửa).
// - Trả về: Sự kiện đã cập nhật.
router.put("/:id", verifyToken, eventManager, uploadEventImages, updateEvent);

// [DELETE] /api/events/:id
// 🗑️ Xóa sự kiện
// - Chức năng: Manager xóa sự kiện của mình (thường là xóa mềm).
// - Trả về: Thông báo thành công.
router.delete("/:id", verifyToken, eventManager, deleteEvent);

// [PUT] /api/events/:id/complete
// ✅ Hoàn thành sự kiện
// - Chức năng: Đánh dấu sự kiện đã kết thúc thành công.
// - Trả về: Sự kiện đã cập nhật trạng thái COMPLETED.
router.put("/:id/complete", verifyToken, eventManager, completeEvent);

// [GET] /api/events/management/:id
// 🛠️ Chi tiết sự kiện (Góc nhìn quản lý)
// - Chức năng: Xem chi tiết sự kiện bao gồm cả các thông tin ẩn/nội bộ (cho Admin/Manager).
// - Trả về: Object Event đầy đủ.
router.get(
  "/management/:id",
  verifyToken,
  eventManager,
  getEventDetailsForManagement
);
export default router;
