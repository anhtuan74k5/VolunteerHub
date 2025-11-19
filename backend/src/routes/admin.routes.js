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

// =============================================================================
// ROUTES QUẢN TRỊ VIÊN (ADMIN)
// =============================================================================

// Áp dụng middleware cho TẤT CẢ các route trong file này
// Bất kỳ ai truy cập các API này đều phải đăng nhập VÀ là Admin
router.use(verifyToken, admin);

// --- QUẢN LÝ SỰ KIỆN ---

// [GET] /api/admin/events/all
// 📋 Lấy danh sách TẤT CẢ sự kiện trong hệ thống
// - Chức năng: Xem toàn bộ sự kiện (pending, approved, rejected, completed).
// - Trả về: Danh sách mảng các object Event.
router.get("/events/all", getAllSystemEvents);

// [GET] /api/admin/events/pending
// ⏳ Lấy danh sách các sự kiện đang chờ duyệt
// - Chức năng: Lọc ra các sự kiện có status = "PENDING".
// - Trả về: Danh sách mảng các object Event chờ duyệt.
router.get("/events/pending", getPendingEvents);

// [PUT] /api/admin/events/:id/approve
// ✅ Phê duyệt một sự kiện
// - Chức năng: Chuyển trạng thái sự kiện từ "PENDING" sang "APPROVED".
// - Trả về: Object Event đã được cập nhật.
router.put("/events/:id/approve", approveEvent);

// [DELETE] /api/admin/events/:id
// 🗑️ Xóa sự kiện (Quyền Admin)
// - Chức năng: Xóa cứng hoặc xóa mềm sự kiện khỏi hệ thống.
// - Trả về: Thông báo thành công.
router.delete("/events/:id", deleteEventByAdmin);

// --- QUẢN LÝ NGƯỜI DÙNG ---

// [GET] /api/admin/users
// 👥 Lấy danh sách tất cả người dùng
// - Chức năng: Xem danh sách Volunteer, Event Manager, Admin.
// - Trả về: Danh sách mảng các object User (thường ẩn password).
router.get("/users", getAllUsers);

// [PUT] /api/admin/users/:id/status
// 🔒 Cập nhật trạng thái người dùng
// - Chức năng: Khóa (LOCKED) hoặc Mở khóa (ACTIVE) tài khoản.
// - Body yêu cầu: { "status": "LOCKED" } hoặc { "status": "ACTIVE" }
// - Trả về: Object User đã cập nhật.
router.put("/users/:id/status", updateUserStatus);

// [PUT] /api/admin/users/:id/role
// 👮 Cập nhật vai trò người dùng
// - Chức năng: Thăng cấp hoặc hạ cấp user (VD: Volunteer -> Event Manager).
// - Body yêu cầu: { "role": "EVENTMANAGER" }
// - Trả về: Object User đã cập nhật.
router.put("/users/:id/role", updateUserRole);

// --- XUẤT DỮ LIỆU ---

// [GET] /api/admin/export/users
// 📤 Xuất danh sách người dùng
// - Chức năng: Tải về file (CSV/Excel) danh sách user.
// - Trả về: File stream (download).
router.get("/export/users", exportUsers);

// --- DASHBOARD ---

// [GET] /api/admin/dashboard
// 📊 Thống kê Dashboard Admin
// - Chức năng: Lấy tổng số user, tổng sự kiện, sự kiện chờ duyệt...
// - Trả về: { totalUsers, totalEvents, pendingEvents, ... }
router.get("/dashboard", getDashboardStats);

export default router;
