// src/routes/admin.routes.js
import express from "express";
import { admin, verifyToken } from "../middlewares/auth.js";
import {
  // Quản lý sự kiện
  getPendingEvents,
  approveEvent,
  deleteEventByAdmin,
  getAllEvents,

  // Quản lý người dùng
  getAllUsers,
  updateUserStatus,

  // Xuất dữ liệu
  exportUsers,

  // Dashboard & thống kê
  getDashboardStats,
  getMonthlyStatistics,

  // Quản lý đăng ký
  getAllRegistrations,
  approveCancelByAdmin,
} from "../controllers/admin.controller.js";

const router = express.Router();

// =================================================================================================
// Middleware chung cho tất cả các route admin
// =================================================================================================
// Tất cả các route trong file này sẽ yêu cầu người dùng phải đăng nhập (verifyToken)
// và có vai trò là 'admin' (admin middleware).
router.use(verifyToken, admin);

// =================================================================================================
// Routes cho Quản lý Sự kiện
// =================================================================================================
// [GET] /api/admin/events -> Lấy tất cả sự kiện (có phân trang và lọc)
router.get("/events", getAllEvents);
// [GET] /api/admin/events/pending -> Lấy các sự kiện đang chờ duyệt
router.get("/events/pending", getPendingEvents);
// [PUT] /api/admin/events/:id/approve -> Duyệt một sự kiện
router.put("/events/:id/approve", approveEvent);
// [DELETE] /api/admin/events/:id -> Xóa một sự kiện
router.delete("/events/:id", deleteEventByAdmin);

// =================================================================================================
// Routes cho Quản lý Người dùng
// =================================================================================================
// [GET] /api/admin/users -> Lấy danh sách người dùng (có phân trang)
router.get("/users", getAllUsers);
// [PUT] /api/admin/users/:id/status -> Cập nhật trạng thái (khóa/mở) tài khoản
router.put("/users/:id/status", updateUserStatus);

// =================================================================================================
// Routes cho Quản lý Đăng ký
// =================================================================================================
// [GET] /api/admin/registrations -> Lấy tất cả đăng ký (có phân trang)
router.get("/registrations", getAllRegistrations);
// [PUT] /api/admin/registrations/:id/approve-cancel -> Admin phê duyệt yêu cầu hủy
router.put("/registrations/:id/approve-cancel", approveCancelByAdmin);

// =================================================================================================
// Routes cho Dashboard & Thống kê
// =================================================================================================
// [GET] /api/admin/dashboard -> Lấy các số liệu thống kê cho dashboard
router.get("/dashboard", getDashboardStats);
// [GET] /api/admin/statistics/monthly -> Lấy thống kê sự kiện theo tháng
router.get("/statistics/monthly", getMonthlyStatistics);

// =================================================================================================
// Routes cho Xuất Dữ liệu
// =================================================================================================
// [GET] /api/admin/export/users -> Xuất danh sách người dùng ra file CSV
router.get("/export/users", exportUsers);

export default router;
