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

// --- Đăng ký ---

// [POST] /api/auth/register/send-otp
// Gửi mã OTP xác thực đến email của người dùng (bước 1 đăng ký)
router.post("/register/send-otp", sendRegisterOtp);

// [POST] /api/auth/register/verify
// Xác thực OTP và tạo tài khoản mới (bước 2 đăng ký)
router.post("/register/verify", verifyAndRegister);

// --- Đăng nhập ---

// [POST] /api/auth/login
// Đăng nhập bằng email/username và mật khẩu, trả về JWT token
router.post("/login", login);

// --- Quên mật khẩu ---

// [POST] /api/auth/reset/send-otp
// Gửi mã OTP khôi phục mật khẩu đến email
router.post("/reset/send-otp", sendResetOtp);

// [POST] /api/auth/reset/verify
// Xác thực OTP và đặt lại mật khẩu mới
router.post("/reset/verify", resetPassword);

// --- Quản lý hồ sơ (Cần đăng nhập - verifyToken) ---

// [GET] /api/auth/me
// Lấy thông tin chi tiết của user đang đăng nhập (dựa trên token)
router.get("/me", verifyToken, getMe);

// [PUT] /api/auth/update
// Cập nhật thông tin hồ sơ (name, birthday, avatar...)
// (uploadAvatar: middleware xử lý file ảnh)
router.put("/update", verifyToken, uploadAvatar, updateProfile);

// [PUT] /api/auth/change-password
// Thay đổi mật khẩu (yêu cầu mật khẩu cũ và mới)
router.put("/change-password", verifyToken, changePassword);

// --- Admin (Cần đăng nhập + quyền Admin) ---

// [GET] /api/auth/all
// Lấy danh sách tất cả người dùng trong hệ thống (chỉ Admin)
// Bạn có thể thêm middleware 'admin' vào đây để bảo mật
router.get("/all", verifyToken, getAllUsers);

export default router;
