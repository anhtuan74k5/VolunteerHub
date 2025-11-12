import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    // --- Thông tin cơ bản cho Tình nguyện viên xem ---
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    category: {
      // Dành cho Tình nguyện viên lọc sự kiện
      type: String,
      required: true,
      // Optional: type: mongoose.Schema.Types.ObjectId, ref: 'Category' nếu bạn muốn làm model Category riêng
    },
    coverImage: {
      // Ảnh bìa sự kiện
      type: String,
      default: "default-event-image.jpg",
    },

    galleryImages: [
      {
        type: String,
      },
    ],

    // --- Trường Vận hành & Quản lý ---
    status: {
      // Dành cho Admin duyệt và quản lý vòng đời sự kiện
      type: String,
      enum: ["pending", "approved", "rejected", "completed"],
      default: "pending",
    },
    createdBy: {
      // Dành cho Event Manager, để biết ai tạo sự kiện
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    // Tự động thêm 2 trường createdAt và updatedAt
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);
export default Event;
