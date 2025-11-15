// src/controllers/event.controller.js
import mongoose from "mongoose";
import Event from "../models/event.js";
import Joi from "joi";
import fs from "fs";
import path from "path";
import Registration from "../models/registration.js";

// HÀM HỖ TRỢ (HELPER) ĐỂ DỌN DẸP FILE CỦA EVENT
const rollbackEventUploads = (req) => {
  if (!req.files) {
    return;
  }
  if (req.files.coverImage && req.files.coverImage.length > 0) {
    const p = path.join(process.cwd(), req.files.coverImage[0].path);
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
      console.log("Đã rollback (xóa) file coverImage do lỗi:", p);
    } catch (e) {
      console.error("Lỗi khi rollback coverImage:", e.message);
    }
  }
  if (req.files.galleryImages && req.files.galleryImages.length > 0) {
    req.files.galleryImages.forEach((file) => {
      const p = path.join(process.cwd(), file.path);
      try {
        if (fs.existsSync(p)) fs.unlinkSync(p);
        console.log("Đã rollback (xóa) file gallery do lỗi:", p);
      } catch (e) {
        console.error("Lỗi khi rollback gallery image:", e.message);
      }
    });
  }
};

// Schema để validate dữ liệu đầu vào khi tạo/sửa sự kiện
// (Đã bao gồm maxParticipants)
const eventSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  date: Joi.date().iso().required(),
  endDate: Joi.date().iso().required().greater(Joi.ref("date")),
  location: Joi.string().required(),
  category: Joi.string().required(),
  maxParticipants: Joi.number().integer().min(1).required(),
});

// [POST] /api/events -> Tạo sự kiện mới
export const createEvent = async (req, res) => {
  try {
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      return res
        .status(400)
        .json({ message: "Dữ liệu không hợp lệ", details: error.details });
    }

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
      ...value, // Đã bao gồm maxParticipants từ Joi
      coverImage: coverImagePath,
      galleryImages: galleryPaths,
      createdBy: req.user._id,
      status: "pending",
    });

    await newEvent.save();
    res.status(201).json({
      message: "Tạo sự kiện thành công, đang chờ duyệt",
      event: newEvent,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [PUT] /api/events/:id -> Cập nhật sự kiện
export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findById(eventId);
    if (!event) {
      throw { status: 404, message: "Không tìm thấy sự kiện" };
    }
    if (event.createdBy.toString() !== req.user._id.toString()) {
      throw { status: 403, message: "Bạn không có quyền sửa sự kiện này" };
    }
    if (event.status !== "pending") {
      throw {
        status: 403,
        message: `Không thể cập nhật. Sự kiện này đã ở trạng thái '${event.status}' (Chỉ được sửa khi 'pending').`,
      };
    }

    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      throw {
        status: 400,
        message: "Dữ liệu không hợp lệ",
        details: error.details,
      };
    }

    const updateData = { ...value }; // Đã bao gồm maxParticipants từ Joi
    const defaultCover = "default-event-image.jpg";

    if (req.files) {
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        updateData.coverImage = `/uploads/events/${req.files.coverImage[0].filename}`;
        if (
          event.coverImage &&
          event.coverImage !== defaultCover &&
          !event.coverImage.startsWith("http")
        ) {
          const oldPath = path.join(process.cwd(), event.coverImage);
          try {
            if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          } catch (e) {
            console.error("Lỗi xóa ảnh bìa cũ:", e.message);
          }
        }
      }
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        updateData.galleryImages = req.files.galleryImages.map(
          (file) => `/uploads/events/${file.filename}`
        );
        if (event.galleryImages && event.galleryImages.length > 0) {
          event.galleryImages.forEach((imagePath) => {
            if (imagePath && !imagePath.startsWith("http")) {
              const oldPath = path.join(process.cwd(), imagePath);
              try {
                if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
              } catch (e) {
                console.error("Lỗi xóa ảnh gallery cũ:", e.message);
              }
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
    if (err.status) {
      return res.status(err.status).json({
        message: err.message,
        details: err.details || undefined,
      });
    }
    console.error("❌ Lỗi trong updateEvent:", err);
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// [DELETE] /api/events/:id -> Xóa sự kiện
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });

    const userRole = req.user.role.toUpperCase();
    if (
      event.createdBy.toString() !== req.user._id.toString() &&
      userRole !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền xóa sự kiện này" });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Xóa sự kiện thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [PUT] /api/events/:id/complete -> Manager đánh dấu sự kiện là hoàn thành
export const completeEvent = async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    }
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật sự kiện này" });
    }
    if (event.status !== "approved") {
      return res.status(400).json({
        message: `Không thể hoàn thành. Sự kiện đang ở trạng thái '${event.status}'.`,
      });
    }
    const now = new Date();
    if (now < new Date(event.date)) {
      return res.status(400).json({ message: "Sự kiện này chưa diễn ra." });
    }
    event.status = "completed";
    event.endDate = now;
    await event.save();
    res
      .status(200)
      .json({ message: "Sự kiện đã được đánh dấu hoàn thành.", event: event });
  } catch (err) {
    console.error("❌ Lỗi trong completeEvent:", err);
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
          date: 1,
          endDate: 1,
          location: 1,
          category: 1,
          coverImage: 1,
          status: 1,
          maxParticipants: 1, // 👈 Hiển thị max

          // Tính toán số lượng hiện tại
          currentParticipants: {
            $size: {
              $filter: {
                input: "$registrations",
                as: "reg",
                cond: { $in: ["$$reg.status", ["approved", "pending"]] },
              },
            },
          }, // 👈 Hiển thị số lượng hiện tại

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

// [GET] /api/events/public/:id -> Xem chi tiết một sự kiện
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
          // Lấy tất cả trường
          name: 1,
          description: 1,
          date: 1,
          endDate: 1,
          location: 1,
          category: 1,
          coverImage: 1,
          galleryImages: 1,
          status: 1,
          maxParticipants: 1, // 👈 Hiển thị max

          // Tính toán số lượng hiện tại
          currentParticipants: {
            $size: {
              $filter: {
                input: "$registrations",
                as: "reg",
                cond: { $in: ["$$reg.status", ["approved", "pending"]] },
              },
            },
          }, // 👈 Hiển thị số lượng hiện tại

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
      { $limit: 1 },
    ]);

    if (!eventArr || eventArr.length === 0) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện hoặc sự kiện chưa được duyệt.",
      });
    }
    res.status(200).json(eventArr[0]); // Trả về object
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] /api/events/my-events -> Manager xem các sự kiện do mình tạo
export const getMyEvents = async (req, res) => {
  try {
    const events = await Event.aggregate([
      // 1. Lọc sự kiện của manager
      { $match: { createdBy: req.user._id } },

      // 2. Join với 'registrations'
      {
        $lookup: {
          from: "registrations",
          localField: "_id",
          foreignField: "event",
          as: "registrations",
        },
      },

      // 3. Định dạng lại
      {
        $project: {
          name: 1,
          date: 1,
          endDate: 1,
          location: 1,
          status: 1,
          maxParticipants: 1, // 👈 Hiển thị max

          // Tính toán số lượng hiện tại
          currentParticipants: {
            $size: {
              $filter: {
                input: "$registrations",
                as: "reg",
                cond: { $in: ["$$reg.status", ["approved", "pending"]] },
              },
            },
          }, // 👈 Hiển thị số lượng hiện tại
        },
      },
      { $sort: { createdAt: -1 } },
    ]);

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] /api/events/public/:id/participants -> Lấy danh sách người tham gia (công khai)
export const getEventParticipants = async (req, res) => {
  try {
    const eventId = req.params.id;

    const event = await Event.findOne({
      _id: eventId,
      status: "approved",
    }).select("_id");

    if (!event) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện hoặc sự kiện chưa được duyệt.",
      });
    }

    const registrations = await Registration.find({
      event: eventId,
      status: "approved",
    })
      .select("volunteer")
      .populate("volunteer", "name email phone");

    const participants = registrations.map((reg) => reg.volunteer);

    res.status(200).json({
      total: participants.length,
      participants: participants,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
