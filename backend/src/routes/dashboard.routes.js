// src/routes/dashboard.routes.js
import express from "express";
import { verifyToken, eventManager } from "../middlewares/auth.js";
import {
  getVolunteerDashboard,
  getManagerEvents,
  getManagerEventRegistrations,
  approveCancelRequest,
  rejectCancelRequest,
} from "../controllers/dashboard.controller.js";

const router = express.Router();

// =============================================================================
// ROUTES DASHBOARD (BẢNG ĐIỀU KHIỂN)
// =============================================================================

// --- VOLUNTEER DASHBOARD ---

// [GET] /api/dashboard/volunteer
// 📊 Dashboard cho Tình nguyện viên
// - Chức năng: Lấy tổng quan hoạt động của volunteer (sự kiện đã tham gia, giờ làm, điểm thưởng...).
// - Trả về: { stats: {...}, upcomingEvents: [...] }
router.get("/volunteer", verifyToken, getVolunteerDashboard);

// --- MANAGER DASHBOARD ---

// [GET] /api/dashboard/manager/events
// 📅 Quản lý sự kiện của Manager
// - Chức năng: Lấy danh sách các sự kiện do Manager này tạo (kèm thống kê số người đăng ký).
// - Trả về: Danh sách sự kiện.
router.get("/manager/events", verifyToken, eventManager, getManagerEvents);

// [GET] /api/dashboard/manager/events/:eventId/registrations
// 👥 Danh sách đăng ký của sự kiện
// - Chức năng: Xem ai đã đăng ký tham gia sự kiện này.
// - Trả về: Danh sách người đăng ký (kèm trạng thái: PENDING, APPROVED...).
router.get(
  "/manager/events/:eventId/registrations",
  verifyToken,
  eventManager,
  getManagerEventRegistrations
);

// [PUT] /api/dashboard/manager/registrations/:id/approve-cancel
// ✅ Phê duyệt hủy đăng ký
// - Chức năng: Chấp nhận yêu cầu hủy tham gia của Volunteer (khi họ xin rút).
// - Trả về: Thông báo thành công.
router.put(
  "/manager/registrations/:id/approve-cancel",
  verifyToken,
  eventManager,
  approveCancelRequest
);

// [PUT] /api/dashboard/manager/registrations/:id/reject-cancel
// ❌ Từ chối hủy đăng ký
// - Chức năng: Không cho phép Volunteer hủy tham gia (giữ nguyên trạng thái APPROVED).
// - Trả về: Thông báo thành công.
router.put(
  "/manager/registrations/:id/reject-cancel",
  verifyToken,
  eventManager,
  rejectCancelRequest
);

export default router;
