// src/controllers/admin.controller.js
import User from "../models/user.js";
import Event from "../models/event.js";
import Registration from "../models/registration.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import fs from "fs";
import path from "path";
import { Parser } from "json2csv";

// --- HÀM HỖ TRỢ XÓA FILE ---
const deleteEventFiles = (event) => {
  const defaultCover = "default-event-image.jpg";
  // Xóa cover
  if (
    event.coverImage &&
    event.coverImage !== defaultCover &&
    !event.coverImage.startsWith("http")
  ) {
    const p = path.join(process.cwd(), event.coverImage);
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (e) {}
  }
  // Xóa gallery
  if (event.galleryImages && event.galleryImages.length > 0) {
    event.galleryImages.forEach((img) => {
      if (img && !img.startsWith("http")) {
        const p = path.join(process.cwd(), img);
        try {
          if (fs.existsSync(p)) fs.unlinkSync(p);
        } catch (e) {}
      }
    });
  }
};

// --- QUẢN LÝ SỰ KIỆN ---

export const getPendingEvents = async (req, res) => {
  try {
    const events = await Event.find({ status: "pending" }).populate(
      "createdBy",
      "name email phone"
    );
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const approveEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true }
    );
    if (!event)
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    res.status(200).json({ message: "Duyệt sự kiện thành công", event });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [DELETE] /api/admin/events/:id
export const deleteEventByAdmin = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event)
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });

    // 1. Xóa file ảnh
    deleteEventFiles(event);

    // 2. Xóa Event
    await Event.findByIdAndDelete(eventId);

    // 3. 🧹 Xóa dữ liệu mồ côi (Registrations, Posts, Comments)
    await Promise.all([
      Registration.deleteMany({ event: eventId }),
      Post.deleteMany({ event: eventId }),
      Comment.deleteMany({ event: eventId }),
    ]);

    res
      .status(200)
      .json({ message: "Xóa sự kiện và dọn dẹp dữ liệu thành công" });
  } catch (error) {
    console.error("❌ Lỗi admin delete event:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// --- QUẢN LÝ NGƯỜI DÙNG ---

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.status(200).json({ message: "Cập nhật trạng thái thành công", user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userIdToUpdate = req.params.id;
    const adminId = req.user._id.toString();

    if (!role)
      return res
        .status(400)
        .json({ message: "Vui lòng cung cấp vai trò mới." });

    const validRoles = ["VOLUNTEER", "EVENTMANAGER", "ADMIN"];
    if (!validRoles.includes(role.toUpperCase())) {
      return res
        .status(400)
        .json({ message: `Vai trò '${role}' không hợp lệ.` });
    }

    if (userIdToUpdate === adminId) {
      return res.status(400).json({
        message: "Admin không thể tự thay đổi vai trò của chính mình.",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userIdToUpdate,
      { role: role.toUpperCase() },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    res.status(200).json({
      message: "Cập nhật vai trò người dùng thành công.",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// --- XUẤT DỮ LIỆU ---
export const exportUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password -__v").lean();
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(users);
    res.header("Content-Type", "text/csv");
    res.attachment("users-export.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// --- DASHBOARD ---
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalEvents = await Event.countDocuments();
    const pendingEventsCount = await Event.countDocuments({
      status: "pending",
    });
    const approvedEventsCount = await Event.countDocuments({
      status: "approved",
    });

    res.status(200).json({
      totalUsers,
      totalEvents,
      pendingEventsCount,
      approvedEventsCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const getAllSystemEvents = async (req, res) => {
  try {
    const events = await Event.find({})
      .populate("createdBy", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
