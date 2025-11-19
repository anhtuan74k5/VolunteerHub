// src/controllers/event.controller.js
import mongoose from "mongoose";
import Event from "../models/event.js";
import Registration from "../models/registration.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import Joi from "joi";
import fs from "fs";
import path from "path";
import User from "../models/user.js";

// --- HÀM HỖ TRỢ ---
const rollbackEventUploads = (req) => {
  if (!req.files) return;
  if (req.files.coverImage && req.files.coverImage.length > 0) {
    const p = path.join(process.cwd(), req.files.coverImage[0].path);
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
    } catch (e) {
      console.error("Lỗi rollback coverImage:", e.message);
    }
  }
  if (req.files.galleryImages && req.files.galleryImages.length > 0) {
    req.files.galleryImages.forEach((file) => {
      const p = path.join(process.cwd(), file.path);
      try {
        if (fs.existsSync(p)) fs.unlinkSync(p);
      } catch (e) {
        console.error("Lỗi rollback gallery:", e.message);
      }
    });
  }
};

// Hàm xóa file ảnh khỏi ổ đĩa khi xóa sự kiện
const deleteEventFiles = (event) => {
  const defaultCover = "default-event-image.jpg";

  // 1. Xóa Cover Image
  if (
    event.coverImage &&
    event.coverImage !== defaultCover &&
    !event.coverImage.startsWith("http")
  ) {
    const p = path.join(process.cwd(), event.coverImage);
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
      console.log("🗑️ Đã xóa ảnh bìa:", p);
    } catch (e) {
      console.error("⚠️ Lỗi xóa ảnh bìa cũ:", e.message);
    }
  }

  // 2. Xóa Gallery Images
  if (event.galleryImages && event.galleryImages.length > 0) {
    event.galleryImages.forEach((img) => {
      if (img && !img.startsWith("http")) {
        const p = path.join(process.cwd(), img);
        try {
          if (fs.existsSync(p)) fs.unlinkSync(p);
          console.log("🗑️ Đã xóa ảnh gallery:", p);
        } catch (e) {
          console.error("⚠️ Lỗi xóa ảnh gallery cũ:", e.message);
        }
      }
    });
  }
};

const eventSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  date: Joi.date().iso().required(),
  endDate: Joi.date().iso().required().greater(Joi.ref("date")),
  location: Joi.string().required(),
  category: Joi.string().required(),
  maxParticipants: Joi.number().integer().min(1).required(),
});

// [POST] /api/events
// [POST] /api/events -> Tạo sự kiện (Đã cập nhật 9 loại Category & Điểm thưởng)
export const createEvent = async (req, res) => {
  try {
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: "Dữ liệu không hợp lệ", details: error.details });
    }

    // 👇 CẤU HÌNH ĐIỂM THƯỞNG CHO 9 LOẠI HÌNH TÌNH NGUYỆN
    // (Bạn có thể điều chỉnh điểm số tùy ý muốn)
    const pointMap = {
      // 1. Tình nguyện cộng đồng (Dọn dẹp, sơn sửa, hỗ trợ người già...)
      Community: 15,

      // 2. Tình nguyện giáo dục (Dạy học, gia sư, thư viện...)
      Education: 20,

      // 3. Tình nguyện chăm sóc sức khỏe (Hiến máu, hỗ trợ bệnh viện...)
      Healthcare: 20,

      // 4. Tình nguyện môi trường (Trồng cây, tái chế, bảo vệ động vật...)
      Environment: 25,

      // 5. Tình nguyện sự kiện (Hỗ trợ hậu cần, lễ tân, hướng dẫn...)
      EventSupport: 10,

      // 6. Tình nguyện kỹ thuật (IT, thiết kế, xây dựng web, sửa chữa...)
      Technical: 25,

      // 7. Tình nguyện cứu trợ – khẩn cấp (Thiên tai, lũ lụt, dịch bệnh...) -> Điểm cao nhất
      Emergency: 35,

      // 8. Tình nguyện trực tuyến (Dịch thuật, nhập liệu, truyền thông online...) -> Điểm thấp hơn vì tiện lợi
      Online: 10,

      // 9. Tình nguyện doanh nghiệp (Hoạt động CSR của công ty)
      Corporate: 15,
    };

    // Lấy điểm theo category gửi lên.
    // Lưu ý: Frontend cần gửi đúng key tiếng Anh như trên (ví dụ: category: "Emergency")
    // Nếu category không khớp danh sách, mặc định là 10 điểm.
    const eventPoints = pointMap[req.body.category] || 10;

    // Xử lý ảnh
    let coverImagePath = "default-event-image.jpg";
    let galleryPaths = [];
    if (req.files) {
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        coverImagePath = `/uploads/events/${req.files.coverImage[0].filename}`;
      }
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        galleryPaths = req.files.galleryImages.map(
          (file) => `/uploads/events/${file.filename}`
        );
      }
    }

    const newEvent = new Event({
      ...value,
      points: eventPoints, // 👈 Lưu điểm đã tính toán vào DB
      coverImage: coverImagePath,
      galleryImages: galleryPaths,
      createdBy: req.user._id,
      status: "pending",
    });

    await newEvent.save();
    res.status(201).json({
      message: "Tạo sự kiện thành công. Điểm thưởng dự kiến: " + eventPoints,
      event: newEvent,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [PUT] /api/events/:id
export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event) throw { status: 404, message: "Không tìm thấy sự kiện" };
    if (event.createdBy.toString() !== req.user._id.toString()) {
      throw { status: 403, message: "Bạn không có quyền sửa sự kiện này" };
    }
    if (event.status !== "pending") {
      throw {
        status: 403,
        message: `Không thể cập nhật. Sự kiện đã ở trạng thái '${event.status}'.`,
      };
    }

    const { error, value } = eventSchema.validate(req.body);
    if (error)
      throw {
        status: 400,
        message: "Dữ liệu không hợp lệ",
        details: error.details,
      };

    const updateData = { ...value };
    const defaultCover = "default-event-image.jpg";

    if (req.files) {
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        updateData.coverImage = `/uploads/events/${req.files.coverImage[0].filename}`;
        // Xóa ảnh cũ
        if (
          event.coverImage &&
          event.coverImage !== defaultCover &&
          !event.coverImage.startsWith("http")
        ) {
          const oldPath = path.join(process.cwd(), event.coverImage);
          try {
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          } catch (e) {}
        }
      }
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        updateData.galleryImages = req.files.galleryImages.map(
          (file) => `/uploads/events/${file.filename}`
        );
        // Xóa gallery cũ
        if (event.galleryImages && event.galleryImages.length > 0) {
          event.galleryImages.forEach((imagePath) => {
            if (imagePath && !imagePath.startsWith("http")) {
              const oldPath = path.join(process.cwd(), imagePath);
              try {
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
              } catch (e) {}
            }
          });
        }
      }
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res
      .status(200)
      .json({ message: "Cập nhật sự kiện thành công", event: updatedEvent });
  } catch (err) {
    rollbackEventUploads(req);
    if (err.status)
      return res
        .status(err.status)
        .json({ message: err.message, details: err.details });
    console.error("❌ Lỗi updateEvent:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// [DELETE] /api/events/:id -> ĐÃ CẬP NHẬT LOGIC XÓA MỒ CÔI
export const deleteEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event)
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });

    const userRole = req.user.role.toUpperCase();
    // Kiểm tra quyền: Phải là người tạo hoặc là ADMIN
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      userRole !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa sự kiện này" });
    }

    // 1. Xóa file ảnh vật lý trên server
    deleteEventFiles(event);

    // 2. Xóa Sự kiện trong DB
    await Event.findByIdAndDelete(eventId);

    // 3. 🧹 DỌN DẸP DỮ LIỆU LIÊN QUAN (Dữ liệu mồ côi)
    // Xóa các đăng ký
    await Registration.deleteMany({ event: eventId });
    // Xóa các bài post
    await Post.deleteMany({ event: eventId });
    // Xóa các comment liên quan đến sự kiện này
    await Comment.deleteMany({ event: eventId });

    res.status(200).json({
      message: "Xóa sự kiện và toàn bộ dữ liệu liên quan thành công.",
    });
  } catch (error) {
    console.error("❌ Lỗi deleteEvent:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [PUT] /api/events/:id/complete -> Hoàn thành & Cộng điểm
export const completeEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);

    if (!event)
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });

    // Kiểm tra quyền của Manager
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật sự kiện này" });
    }
    // Kiểm tra trạng thái
    if (event.status !== "approved") {
      return res
        .status(400)
        .json({ message: "Chỉ sự kiện đã duyệt mới được hoàn thành." });
    }
    if (event.status === "completed") {
      return res
        .status(400)
        .json({ message: "Sự kiện đã hoàn thành trước đó rồi." });
    }

    // 👇 1. CỘNG 20 ĐIỂM CHO MANAGER (Người tạo)
    await User.findByIdAndUpdate(event.createdBy, { $inc: { points: 20 } });

    // 👇 2. CỘNG 10 ĐIỂM CHO CÁC VOLUNTEER ĐÃ ĐƯỢC DUYỆT
    // Lấy danh sách người tham gia đã được approved
    const approvedRegistrations = await Registration.find({
      event: eventId,
      status: "approved",
    });

    const volunteerIds = approvedRegistrations.map((reg) => reg.volunteer);

    if (volunteerIds.length > 0) {
      await User.updateMany(
        { _id: { $in: volunteerIds } }, // Tìm những user có ID trong danh sách
        { $inc: { points: 10 } } // Cộng 10 điểm
      );
    }

    // Cập nhật trạng thái sự kiện
    event.status = "completed";
    event.endDate = new Date();
    await event.save();

    res.status(200).json({
      message: `Sự kiện hoàn thành. Manager +20 điểm. ${volunteerIds.length} tình nguyện viên +10 điểm.`,
      event: event,
    });
  } catch (err) {
    console.error("❌ Lỗi completeEvent:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// [GET] /api/events/public -> Lấy danh sách sự kiện đã được duyệt
export const getApprovedEvents = async (req, res) => {
  try {
    const { category, date } = req.query;
    const filter = { status: "approved" };

    if (category) {
      filter.category = category;
    }
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      filter.date = { $gte: startDate, $lt: endDate };
    }

    // Dùng Aggregate để join và đếm
    const events = await Event.aggregate([
      // 1. Lọc các sự kiện (approved, theo category, date...)
      { $match: filter },

      // 2. Join với collection 'registrations' để lấy danh sách đăng ký
      {
        $lookup: {
          from: "registrations",
          localField: "_id",
          foreignField: "event",
          as: "registrations",
        },
      },

      // 3. Join với 'users' để lấy thông tin người tạo
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creatorInfo",
        },
      },

      // 4. Định dạng lại dữ liệu
      {
        $project: {
          name: 1,
          description: 1, // 👈 Đã thêm trường này theo yêu cầu của bạn
          date: 1,
          endDate: 1,
          location: 1,
          category: 1,
          coverImage: 1,
          status: 1,
          maxParticipants: 1,

          // Tính toán số lượng hiện tại
          currentParticipants: {
            $size: {
              $filter: {
                input: "$registrations",
                as: "reg",
                cond: { $in: ["$$reg.status", ["approved"]] },
              },
            },
          },

          // Lấy thông tin người tạo
          createdBy: {
            $arrayElemAt: [
              {
                $map: {
                  input: "$creatorInfo",
                  as: "c",
                  in: { _id: "$$c._id", name: "$$c.name", phone: "$$c.phone" },
                },
              },
              0,
            ],
          },
        },
      },
      { $sort: { date: 1 } }, // Sắp xếp
    ]);

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] /api/events/public/:id
export const getEventDetails = async (req, res) => {
  try {
    const eventId = new mongoose.Types.ObjectId(req.params.id);
    const eventArr = await Event.aggregate([
      { $match: { _id: eventId, status: "approved" } },
      {
        $lookup: {
          from: "registrations",
          localField: "_id",
          foreignField: "event",
          as: "registrations",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creatorInfo",
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          date: 1,
          endDate: 1,
          location: 1,
          category: 1,
          coverImage: 1,
          galleryImages: 1,
          status: 1,
          maxParticipants: 1,
          currentParticipants: {
            $size: {
              $filter: {
                input: "$registrations",
                as: "reg",
                cond: { $in: ["$$reg.status", ["approved"]] },
              },
            },
          },
          createdBy: {
            $arrayElemAt: [
              {
                $map: {
                  input: "$creatorInfo",
                  as: "c",
                  in: { _id: "$$c._id", name: "$$c.name", phone: "$$c.phone" },
                },
              },
              0,
            ],
          },
        },
      },
      { $limit: 1 },
    ]);

    if (!eventArr || eventArr.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện hoặc sự kiện chưa được duyệt.",
      });
    }
    res.status(200).json(eventArr[0]);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] /api/events/my-events
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.aggregate([
      { $match: { createdBy: req.user._id } },
      {
        $lookup: {
          from: "registrations",
          localField: "_id",
          foreignField: "event",
          as: "registrations",
        },
      },
      {
        $project: {
          name: 1,
          date: 1,
          endDate: 1,
          location: 1,
          status: 1,
          maxParticipants: 1,
          currentParticipants: {
            $size: {
              $filter: {
                input: "$registrations",
                as: "reg",
                cond: { $in: ["$$reg.status", ["approved"]] },
              },
            },
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] /api/events/public/:id/participants
export const getEventParticipants = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findOne({
      _id: eventId,
      status: "approved",
    }).select("_id");

    if (!event)
      return res.status(404).json({ message: "Không tìm thấy sự kiện." });

    const registrations = await Registration.find({
      event: eventId,
      status: "approved",
    })
      .select("volunteer")
      .populate("volunteer", "name email phone");

    const participants = registrations.map((reg) => reg.volunteer);
    res
      .status(200)
      .json({ total: participants.length, participants: participants });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] /api/events/management/:id -> Xem chi tiết sự kiện (Dành cho Admin & Manager)
export const getEventDetailsForManagement = async (req, res) => {
  try {
    const eventId = new mongoose.Types.ObjectId(req.params.id);
    const userId = req.user._id;
    const userRole = req.user.role;

    // 1. Tạo điều kiện tìm kiếm cơ bản
    let matchCondition = { _id: eventId };

    // 2. Phân quyền:
    // - Nếu KHÔNG phải ADMIN, buộc phải thêm điều kiện "người tạo là chính mình"
    // - Nếu là ADMIN, bỏ qua dòng này (xem được tất cả)
    if (userRole !== "ADMIN") {
      matchCondition.createdBy = userId;
    }

    const eventArr = await Event.aggregate([
      { $match: matchCondition }, // Áp dụng điều kiện lọc

      // Join với registrations để đếm số liệu
      {
        $lookup: {
          from: "registrations",
          localField: "_id",
          foreignField: "event",
          as: "registrations",
        },
      },
      // Join với users để lấy thông tin người tạo
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "creatorInfo",
        },
      },
      {
        $project: {
          name: 1,
          description: 1,
          date: 1,
          endDate: 1,
          location: 1,
          category: 1,
          coverImage: 1,
          galleryImages: 1,
          status: 1,
          maxParticipants: 1,

          // Thống kê chi tiết hơn cho quản lý
          stats: {
            totalRegistrations: { $size: "$registrations" }, // Tổng số người đăng ký (cả pending/approved)
            approvedCount: {
              $size: {
                $filter: {
                  input: "$registrations",
                  as: "reg",
                  cond: { $eq: ["$$reg.status", "approved"] },
                },
              },
            },
            pendingCount: {
              $size: {
                $filter: {
                  input: "$registrations",
                  as: "reg",
                  cond: { $eq: ["$$reg.status", "pending"] },
                },
              },
            },
          },

          // Thông tin người tạo
          createdBy: {
            $arrayElemAt: [
              {
                $map: {
                  input: "$creatorInfo",
                  as: "c",
                  in: {
                    _id: "$$c._id",
                    name: "$$c.name",
                    email: "$$c.email",
                    phone: "$$c.phone",
                  },
                },
              },
              0,
            ],
          },
        },
      },
    ]);

    if (!eventArr || eventArr.length === 0) {
      return res.status(404).json({
        message:
          "Không tìm thấy sự kiện hoặc bạn không có quyền truy cập sự kiện này.",
      });
    }

    res.status(200).json(eventArr[0]);
  } catch (error) {
    console.error("❌ Lỗi getEventDetailsForManagement:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
