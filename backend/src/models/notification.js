// src/models/notification.js
import mongoose from "mongoose";

// Định nghĩa schema cho thông báo
const notificationSchema = new mongoose.Schema(
  {
    // Người dùng nhận thông báo
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến model User
      required: true, // Bắt buộc phải có
    },
    // Loại thông báo
    type: {
      type: String,
      enum: [
        "registration_approved", // Đăng ký được duyệt
        "cancel_approved", // Yêu cầu hủy được chấp thuận
        "cancel_rejected", // Yêu cầu hủy bị từ chối
      ],
      required: true, // Bắt buộc phải có
    },
    // Nội dung thông báo
    message: {
      type: String,
      required: true, // Bắt buộc phải có
    },
    // Trạng thái đã đọc hay chưa
    isRead: {
      type: Boolean,
      default: false, // Mặc định là chưa đọc
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Tạo model Notification từ schema
const Notification = mongoose.model("Notification", notificationSchema);
// Xuất model để sử dụng ở nơi khác
export default Notification;
