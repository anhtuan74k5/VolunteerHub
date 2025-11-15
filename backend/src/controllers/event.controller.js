// src/controllers/event.controller.js
import Event from "../models/event.js";
import Joi from "joi";
import fs from "fs";
import path from "path";

// HÀM HỖ TRỢ (HELPER) ĐỂ DỌN DẸP FILE CỦA EVENT
// Chúng ta cần hàm riêng vì event có nhiều file (coverImage, galleryImages)
const rollbackEventUploads = (req) => {
  if (!req.files) {
    // Không có file nào được upload, không cần làm gì
    return;
  }

  // Xóa coverImage (nếu có)
  if (req.files.coverImage && req.files.coverImage.length > 0) {
    const p = path.join(process.cwd(), req.files.coverImage[0].path);
    try {
      if (fs.existsSync(p)) fs.unlinkSync(p);
      console.log("Đã rollback (xóa) file coverImage do lỗi:", p);
    } catch (e) {
      console.error("Lỗi khi rollback coverImage:", e.message);
    }
  }

  // Xóa galleryImages (nếu có)
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
const eventSchema = Joi.object({
  name: Joi.string().min(3).required(),
  description: Joi.string().min(10).required(),
  date: Joi.date().iso().required(),
  endDate: Joi.date().iso().required().greater(Joi.ref("date")),
  location: Joi.string().required(),
  category: Joi.string().required(),
});

// [POST] /api/events -> Tạo sự kiện mới
/**
 * [POST] /api/events -> Tạo sự kiện mới
 * (Đã hoàn thiện - Hỗ trợ upload ảnh bìa và thư viện ảnh)
 */
export const createEvent = async (req, res) => {
  try {
    // 1. Validate dữ liệu text (name, description...) từ req.body
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      // Nếu validate lỗi, trả về chi tiết lỗi
      return res
        .status(400)
        .json({ message: "Dữ liệu không hợp lệ", details: error.details });
    }

    // 2. Xử lý file ảnh (coverImage và galleryImages) từ req.files
    // req.files được tạo ra bởi middleware 'uploadEventImages'
    // Nó sẽ có dạng: { coverImage: [file], galleryImages: [file1, file2] }

    let coverImagePath = "default-event-image.jpg"; // Lấy giá trị mặc định từ model
    let galleryPaths = []; // Mặc định là mảng rỗng

    // Kiểm tra xem req.files có tồn tại không
    if (req.files) {
      // Xử lý ảnh bìa (coverImage)
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        // Lấy tên file đã được Multer lưu và tạo đường dẫn web
        coverImagePath = `/uploads/events/${req.files.coverImage[0].filename}`;
      }

      // Xử lý thư viện ảnh (galleryImages)
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        // Lặp qua mảng file và tạo mảng các đường dẫn web
        galleryPaths = req.files.galleryImages.map(
          (file) => `/uploads/events/${file.filename}`
        );
      }
    }

    // 3. Tạo sự kiện mới trong database
    const newEvent = new Event({
      ...value, // Dữ liệu text đã được Joi validate (name, desc, date...)
      coverImage: coverImagePath, // Đường dẫn ảnh bìa đã xử lý
      galleryImages: galleryPaths, // Mảng các đường dẫn ảnh gallery
      createdBy: req.user._id, // Gắn ID của người tạo (từ middleware verifyToken)
      status: "pending", // Mặc định chờ Admin duyệt
    });

    // 4. Lưu sự kiện vào DB
    await newEvent.save();

    // 5. Trả về thông báo thành công
    res.status(201).json({
      message: "Tạo sự kiện thành công, đang chờ duyệt",
      event: newEvent,
    });
  } catch (error) {
    // Xử lý nếu có lỗi server
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

//**[PUT] /api/events/:id -> Cập nhật sự kiện
export const updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // --- BƯỚC 1: TÌM SỰ KIỆN ---
    const event = await Event.findById(eventId);
    if (!event) {
      throw { status: 404, message: "Không tìm thấy sự kiện" }; // 👈 Dùng THROW
    }

    // --- BƯỚC 2: KIỂM TRA QUYỀN (Chủ sở hữu) ---
    if (event.createdBy.toString() !== req.user._id.toString()) {
      throw { status: 403, message: "Bạn không có quyền sửa sự kiện này" }; // 👈 Dùng THROW
    }

    // --- BƯỚC 3: KIỂM TRA NGHIỆP VỤ (YÊU CẦU CỦA BẠN) ---
    if (event.status !== "pending") {
      throw {
        status: 403,
        message: `Không thể cập nhật. Sự kiện này đã ở trạng thái '${event.status}' (Chỉ được sửa khi 'pending').`,
      }; // 👈 Dùng THROW
    }

    // --- BƯỚC 4: VALIDATE DỮ LIỆU TEXT (TỪ REQ.BODY) ---
    const { error, value } = eventSchema.validate(req.body);
    if (error) {
      // 👈 Dùng THROW cho lỗi Joi
      throw {
        status: 400,
        message: "Dữ liệu không hợp lệ",
        details: error.details,
      };
    }

    // --- BƯỚC 5: CHUẨN BỊ DỮ LIỆU CẬP NHẬT ---
    const updateData = { ...value }; // Gán dữ liệu text (name, desc...)
    const defaultCover = "default-event-image.jpg";

    // --- BƯỚC 6: XỬ LÝ FILE UPLOAD (NẾU CÓ) ---
    // (Logic xóa file CŨ của bạn đã đúng)
    if (req.files) {
      // 6.1 Xử lý ảnh bìa MỚI
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        updateData.coverImage = `/uploads/events/${req.files.coverImage[0].filename}`;
        // Xóa ảnh bìa CŨ
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

      // 6.2 Xử lý thư viện ảnh MỚI (Logic: Thay thế toàn bộ)
      if (req.files.galleryImages && req.files.galleryImages.length > 0) {
        updateData.galleryImages = req.files.galleryImages.map(
          (file) => `/uploads/events/${file.filename}`
        );
        // Xóa toàn bộ ảnh gallery CŨ
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

    // --- BƯỚC 7: CẬP NHẬT DATABASE ---
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    // --- BƯỚC 8: TRẢ KẾT QUẢ ---
    res
      .status(200)
      .json({ message: "Cập nhật sự kiện thành công", event: updatedEvent });
  } catch (err) {
    // --- BƯỚC 9: KHỐI CATCH-ALL (BẮT TẤT CẢ LỖI) ---

    // **RẤT QUAN TRỌNG: Luôn gọi rollback**
    // Hàm helper này sẽ dọn dẹp bất kỳ file nào (cover/gallery) đã được upload
    rollbackEventUploads(req);

    // Xử lý lỗi 4xx mà chúng ta đã 'throw'
    if (err.status) {
      return res.status(err.status).json({
        message: err.message,
        details: err.details || undefined, // Gửi chi tiết lỗi Joi (nếu có)
      });
    }

    // Các lỗi 500 khác (ví dụ: lỗi kết nối DB)
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

    // Chỉ người tạo sự kiện hoặc Admin mới có quyền xóa
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

/**
 * [PUT] /api/events/:id/complete -> Manager đánh dấu sự kiện là hoàn thành
 */
export const completeEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    // --- BƯỚC 1: TÌM SỰ KIỆN ---
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    }

    // --- BƯỚC 2: KIỂM TRA QUYỀN (Chủ sở hữu) ---
    if (event.createdBy.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Bạn không có quyền cập nhật sự kiện này" });
    }

    // --- BƯỚC 3: KIỂM TRA NGHIỆP VỤ ---

    // Chỉ có thể hoàn thành một sự kiện đã được 'approved'
    if (event.status !== "approved") {
      return res.status(400).json({
        message: `Không thể hoàn thành. Sự kiện đang ở trạng thái '${event.status}'.`,
      });
    }

    // Kiểm tra an toàn: Không cho phép hoàn thành sự kiện chưa diễn ra
    const now = new Date();
    if (now < new Date(event.date)) {
      return res.status(400).json({ message: "Sự kiện này chưa diễn ra." });
    }

    // --- BƯỚC 4: CẬP NHẬT DATABASE ---
    // Cập nhật status VÀ endDate như yêu cầu của bạn
    event.status = "completed";
    event.endDate = now; // Cập nhật ngày kết thúc là "ngay bây giờ"

    await event.save(); // Lưu thay đổi

    // --- BƯỚC 5: TRẢ KẾT QUẢ ---
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
    const { category, date } = req.query; // Nhận tham số lọc từ URL

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

    const events = await Event.find(filter)
      .sort({ date: 1 })
      .populate("createdBy", "name email phone"); // Lấy tên người tạo

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] /api/events/public/:id -> Xem chi tiết một sự kiện
export const getEventDetails = async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      status: "approved",
    }).populate("createdBy", "name email phone");

    if (!event) {
      return res.status(404).json({
        message: "Không tìm thấy sự kiện hoặc sự kiện chưa được duyệt.",
      });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] /api/events/my-events -> Manager xem các sự kiện do mình tạo
export const getMyEvents = async (req, res) => {
  try {
    // Lấy tất cả sự kiện có createdBy bằng ID của user đang đăng nhập
    const events = await Event.find({ createdBy: req.user._id }).sort({
      createdAt: -1,
    }); // Sắp xếp mới nhất lên đầu

    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
