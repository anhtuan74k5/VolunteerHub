import { Router } from "express";
import {
  // Đăng ký
  sendRegisterOtp,
  verifyAndRegister,
  // Đăng nhập
  login,
  // Hồ sơ
  getMe,
  updateProfile,
  changePassword,
  // Quên mật khẩu
  sendResetOtp,
  resetPassword,
  // Admin
  getAllUsers,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.js";
import { uploadAvatar } from "../middlewares/upload.js";
const router = Router();

// =============================================================================
// ROUTES XÁC THỰC & NGƯỜI DÙNG (AUTH & USER)
// =============================================================================

// --- ĐĂNG KÝ ---

// [POST] /api/auth/register/send-otp
// 📧 Gửi OTP đăng ký
// - Chức năng: Gửi mã OTP 6 số qua email để xác thực trước khi tạo tài khoản.
// - Body yêu cầu: { "email": "user@example.com" }
// - Trả về: Thông báo thành công (OTP được gửi).
router.post("/register/send-otp", sendRegisterOtp);

// [POST] /api/auth/register/verify
// ✅ Xác thực OTP & Tạo tài khoản
// - Chức năng: Kiểm tra OTP, nếu đúng thì tạo user mới.
// - Body yêu cầu: { "email", "otp", "name", "username", "password", "birthday", "gender", "phone" }
// - Trả về: Thông báo thành công.
router.post("/register/verify", verifyAndRegister);

// --- ĐĂNG NHẬP ---

// [POST] /api/auth/login
// 🔑 Đăng nhập
// - Chức năng: Xác thực user và trả về JWT token.
// - Body yêu cầu: { "identifier": "email_or_username", "password": "..." }
// - Trả về: { "token": "...", "user": { ... } }
router.post("/login", login);

// --- QUÊN MẬT KHẨU ---

// [POST] /api/auth/reset/send-otp
// 🆘 Gửi OTP khôi phục mật khẩu
// - Chức năng: Gửi OTP reset password nếu email tồn tại.
// - Body yêu cầu: { "email": "..." }
// - Trả về: Thông báo thành công.
router.post("/reset/send-otp", sendResetOtp);

// [POST] /api/auth/reset/verify
// 🔄 Đặt lại mật khẩu mới
// - Chức năng: Kiểm tra OTP và cập nhật password mới.
// - Body yêu cầu: { "email", "otp", "newPassword" }
// - Trả về: Thông báo thành công.
router.post("/reset/verify", resetPassword);

// --- QUẢN LÝ HỒ SƠ (Yêu cầu đăng nhập) ---

// [GET] /api/auth/me
// 👤 Lấy thông tin cá nhân
// - Chức năng: Lấy thông tin chi tiết của user từ token.
// - Trả về: Object User đầy đủ.
router.get("/me", verifyToken, getMe);

// [PUT] /api/auth/update
// ✏️ Cập nhật hồ sơ
// - Chức năng: Sửa thông tin cá nhân (có hỗ trợ upload avatar).
// - Body yêu cầu: Form-data (name, birthday, phone, avatar file...).
// - Trả về: Object User sau khi update.
router.put("/update", verifyToken, uploadAvatar, updateProfile);

// [PUT] /api/auth/change-password
// 🔐 Đổi mật khẩu
// - Chức năng: Người dùng tự đổi mật khẩu khi đang đăng nhập.
// - Body yêu cầu: { "oldPassword", "newPassword" }
// - Trả về: Thông báo thành công.
router.put("/change-password", verifyToken, changePassword);

// --- ADMIN ---

// [GET] /api/auth/all
// 📋 Lấy danh sách tất cả user (Admin)
// - Chức năng: API phụ trợ để lấy list user (thường dùng cho admin).
// - Trả về: Danh sách user.
router.get("/all", verifyToken, getAllUsers);

export default router;
