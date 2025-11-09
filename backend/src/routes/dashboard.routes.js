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

// =================================================================================================
// Routes cho Volunteer
// =================================================================================================

// [GET] /api/dashboard/volunteer
// 📊 Lấy dữ liệu dashboard cho volunteer (sự kiện đã tham gia, sắp tham gia,...)
// Yêu cầu xác thực token
router.get("/volunteer", verifyToken, getVolunteerDashboard);

// =================================================================================================
// Routes cho Manager
// =================================================================================================

// [GET] /api/dashboard/manager/events
// 📅 Lấy danh sách sự kiện do manager tạo, kèm theo thống kê đăng ký
// Yêu cầu xác thực token và quyền manager
router.get("/manager/events", verifyToken, eventManager, getManagerEvents);

// [GET] /api/dashboard/manager/events/:eventId/registrations
// 👥 Lấy danh sách người đăng ký cho một sự kiện cụ thể
// Yêu cầu xác thực token và quyền manager
router.get(
  "/manager/events/:eventId/registrations",
  verifyToken,
  eventManager,
  getManagerEventRegistrations
);

// [PUT] /api/dashboard/manager/registrations/:id/approve-cancel
// ✅ Phê duyệt yêu cầu hủy đăng ký của một volunteer
// Yêu cầu xác thực token và quyền manager
router.put(
  "/manager/registrations/:id/approve-cancel",
  verifyToken,
  eventManager,
  approveCancelRequest
);

// [PUT] /api/dashboard/manager/registrations/:id/reject-cancel
// ❌ Từ chối yêu cầu hủy đăng ký của một volunteer
// Yêu cầu xác thực token và quyền manager
router.put(
  "/manager/registrations/:id/reject-cancel",
  verifyToken,
  eventManager,
  rejectCancelRequest
);

export default router;
