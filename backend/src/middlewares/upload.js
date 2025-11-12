// src/middlewares/upload.js
import multer from "multer";
import path from "path";

// 1. Hàm kiểm tra loại file (Giữ nguyên)
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Lỗi: Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif)!"), false);
  }
};

// 2. Cấu hình cho Upload Avatar
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/avatars");
  },

  // SỬA LẠI HÀM FILENAME NÀY
  filename: function (req, file, cb) {
    // Thêm Math.round(Math.random() * 1E9) để đảm bảo duy nhất
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `user-${req.user._id}-${uniqueSuffix}` + path.extname(file.originalname)
    );
  },
});

export const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
}).single("avatar");

// 3. Cấu hình cho Upload Ảnh Sự kiện
const eventStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/events");
  },

  // SỬA LẠI HÀM FILENAME NÀY
  filename: function (req, file, cb) {
    // Thêm Math.round(Math.random() * 1E9) để đảm bảo duy nhất
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Chúng ta cũng có thể dùng 'file.fieldname' (là 'coverImage' hoặc 'galleryImages')
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

export const uploadEventImages = multer({
  storage: eventStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: "coverImage", maxCount: 1 },
  { name: "galleryImages", maxCount: 10 },
]);
