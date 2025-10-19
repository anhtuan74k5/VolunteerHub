import mongoose from "mongoose";

// Định nghĩa schema cho việc đăng ký sự kiện
const registrationSchema = new mongoose.Schema(
  {
    // ID của sự kiện mà tình nguyện viên đăng ký
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event", // Tham chiếu đến model Event
      required: true, // Bắt buộc phải có
    },
    // ID của tình nguyện viên đăng ký
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến model User
      required: true, // Bắt buộc phải có
    },
    // Trạng thái của đơn đăng ký
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "completed", "canceled"], // Các giá trị hợp lệ
      default: "pending", // Giá trị mặc định
    },
    // Yêu cầu hủy đăng ký
    cancelRequest: {
      type: Boolean,
      default: false, // Mặc định là không có yêu cầu hủy
    },
  },
  { timestamps: true } // Tự động thêm createdAt và updatedAt
);

// Ngăn một người đăng ký cùng một sự kiện nhiều lần
registrationSchema.index({ event: 1, volunteer: 1 }, { unique: true });

// Tạo model Registration từ schema
const Registration = mongoose.model("Registration", registrationSchema);
// Xuất model để sử dụng ở nơi khác
export default Registration;
