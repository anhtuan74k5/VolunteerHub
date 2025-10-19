import express from "express";
import { verifyToken, eventManager } from "../middlewares/auth.js";
import {
  registerForEvent,
  cancelRegistration,
  getMyHistory,
  getEventRegistrations,
  updateRegistrationStatus,
  markAsCompleted,
  requestCancelRegistration,
} from "../controllers/registration.controller.js";

const router = express.Router();

// =================================================================================================
// Routes cho Volunteer (Yêu cầu xác thực token)
// =================================================================================================

// [POST] /api/registrations/:eventId
// 📝 Đăng ký tham gia một sự kiện
router.post("/:eventId", verifyToken, registerForEvent);

// [DELETE] /api/registrations/:eventId
// 🗑️ Hủy đăng ký tham gia một sự kiện (trước khi được duyệt)
router.delete("/:eventId", verifyToken, cancelRegistration);

// [GET] /api/registrations/history/my
// 📜 Lấy lịch sử đăng ký của cá nhân volunteer
router.get("/history/my", verifyToken, getMyHistory);

// [PUT] /api/registrations/:registrationId/cancel-request
// ❓ Gửi yêu cầu hủy đăng ký (khi đã được duyệt)
router.put(
  "/:registrationId/cancel-request",
  verifyToken,
  requestCancelRegistration
);

// =================================================================================================
// Routes cho Event Manager (Yêu cầu xác thực token và quyền manager)
// =================================================================================================

// [GET] /api/registrations/:eventId/participants
// 👥 Lấy danh sách tất cả các đăng ký của một sự kiện
router.get(
  "/:eventId/participants",
  verifyToken,
  eventManager,
  getEventRegistrations
);

// [PUT] /api/registrations/:registrationId/status
// 🔄 Cập nhật trạng thái của một đơn đăng ký (pending -> approved/rejected)
router.put(
  "/:registrationId/status",
  verifyToken,
  eventManager,
  updateRegistrationStatus
);

// [PUT] /api/registrations/:registrationId/complete
// ✔️ Đánh dấu một đăng ký là đã hoàn thành (sau khi sự kiện kết thúc)
router.put(
  "/:registrationId/complete",
  verifyToken,
  eventManager,
  markAsCompleted
);

export default router;
