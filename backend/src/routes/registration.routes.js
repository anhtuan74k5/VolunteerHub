import express from "express";
import { verifyToken, eventManager } from "../middlewares/auth.js";
import {
  registerForEvent,
  cancelRegistration,
  getMyHistory,
  getEventRegistrations,
  updateRegistrationStatus,
  markAsCompleted,
} from "../controllers/registration.controller.js";

const router = express.Router();

// =============================================================================
// ROUTES ĐĂNG KÝ THAM GIA (REGISTRATIONS)
// =============================================================================

// --- VOLUNTEER ROUTES ---

// [POST] /api/registrations/:eventId
// 📝 Đăng ký tham gia sự kiện
// - Chức năng: Volunteer gửi yêu cầu tham gia một sự kiện.
// - Trả về: Thông tin đăng ký (trạng thái PENDING).
router.post("/:eventId", verifyToken, registerForEvent);

// [DELETE] /api/registrations/:eventId
// ❌ Hủy đăng ký
// - Chức năng: Volunteer hủy yêu cầu tham gia (nếu chưa được duyệt hoặc tùy quy định).
// - Trả về: Thông báo thành công.
router.delete("/:eventId", verifyToken, cancelRegistration);

// [GET] /api/registrations/history/my
// 📜 Lịch sử tham gia
// - Chức năng: Xem danh sách các sự kiện mình đã đăng ký/tham gia.
// - Trả về: Danh sách đăng ký kèm thông tin sự kiện.
router.get("/history/my", verifyToken, getMyHistory);

// --- MANAGER ROUTES ---

// [GET] /api/registrations/:eventId/participants
// 📋 Danh sách người đăng ký (Manager)
// - Chức năng: Manager xem danh sách volunteer đăng ký sự kiện của mình.
// - Trả về: Danh sách người đăng ký.
router.get(
  "/:eventId/participants",
  verifyToken,
  eventManager,
  getEventRegistrations
);

// [PUT] /api/registrations/:registrationId/status
// 🚦 Cập nhật trạng thái đăng ký
// - Chức năng: Duyệt (APPROVED) hoặc Từ chối (REJECTED) volunteer.
// - Body yêu cầu: { "status": "APPROVED" } hoặc { "status": "REJECTED" }
// - Trả về: Thông tin đăng ký đã cập nhật.
router.put(
  "/:registrationId/status",
  verifyToken,
  eventManager,
  updateRegistrationStatus
);

// [PUT] /api/registrations/:registrationId/complete
// 🏅 Xác nhận hoàn thành
// - Chức năng: Đánh dấu volunteer đã hoàn thành nhiệm vụ sau khi sự kiện kết thúc.
// - Trả về: Thông tin đăng ký đã cập nhật (status: COMPLETED).
router.put(
  "/:registrationId/complete",
  verifyToken,
  eventManager,
  markAsCompleted
);

export default router;
