import express from "express";
import { admin, verifyToken } from "../middlewares/auth.js";
import {
  getPendingEvents,
  approveEvent,
  deleteEventByAdmin,
  getAllSystemEvents,
  getAllUsers,
  updateUserStatus,
  exportUsers,
  getDashboardStats,
  updateUserRole,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Áp dụng middleware cho TẤT CẢ các route trong file này
// Bất kỳ ai truy cập các API này đều phải đăng nhập VÀ là Admin
// router.use() sẽ áp dụng (verifyToken, admin) cho mọi route được định nghĩa bên dưới
router.use(verifyToken, admin);

// --- Routes cho Quản lý Sự kiện ---

// [GET] /api/admin/events/all
// Lấy danh sách TẤT CẢ sự kiện trong hệ thống (không phân biệt pending, approved...)
router.get("/events/all", getAllSystemEvents);

// [GET] /api/admin/events/pending
// Lấy danh sách các sự kiện đang chờ duyệt (status: "pending")
router.get("/events/pending", getPendingEvents);

// [PUT] /api/admin/events/:id/approve
// Phê duyệt một sự kiện (chuyển status thành "approved")
router.put("/events/:id/approve", approveEvent);

// [DELETE] /api/admin/events/:id
// Admin xóa bất kỳ sự kiện nào (thường dùng khi sự kiện vi phạm)
router.delete("/events/:id", deleteEventByAdmin);

// --- Routes cho Quản lý Người dùng ---

// [GET] /api/admin/users
// Lấy danh sách tất cả người dùng (Volunteers, Managers, Admins)
router.get("/users", getAllUsers);

// [PUT] /api/admin/users/:id/status
// Cập nhật trạng thái của người dùng (ví dụ: "ACTIVE" hoặc "LOCKED")
router.put("/users/:id/status", updateUserStatus);

// [PUT] /api/admin/users/:id/role
// Cập nhật vai trò (phân quyền) cho người dùng
router.put("/users/:id/role", updateUserRole);

// --- Route cho Xuất Dữ liệu ---

// [GET] /api/admin/export/users
// Xuất danh sách người dùng ra file (ví dụ: CSV, Excel)
router.get("/export/users", exportUsers);

// --- Route cho Dashboard ---

// [GET] /api/admin/dashboard
// Lấy các số liệu thống kê tổng quan cho trang Dashboard của Admin
router.get("/dashboard", getDashboardStats);

export default router;
