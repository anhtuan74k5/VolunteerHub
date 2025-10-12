import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

/**
 * 🔑 Đăng nhập bằng email hoặc username
 */
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu." });
    }

    // ✅ Tìm user theo email hoặc username
    const user = await User.findOne(
      identifier.includes("@")
        ? { email: identifier }
        : { username: identifier }
    );
    if (!user)
      return res.status(404).json({ message: "Tài khoản không tồn tại." });

    // ✅ Kiểm tra mật khẩu
    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ message: "Mật khẩu không chính xác." });

    // ✅ Kiểm tra trạng thái
    if (user.status && user.status !== "ACTIVE") {
      return res.status(403).json({ message: "Tài khoản đang bị khóa." });
    }

    // ✅ Tạo JWT
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        birthday: user.birthday,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("❌ Lỗi trong login:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

/**
 * 👤 Lấy thông tin người dùng hiện tại từ JWT
 */
export const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc chưa đăng nhập." });
    }

    const user = await User.findById(req.user.userId).select("-password");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
      birthday: user.birthday,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    });
  } catch (err) {
    console.error("❌ Lỗi trong getMe:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

/**
 * ✏️ Cập nhật thông tin người dùng hiện tại
 */
export const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res
        .status(401)
        .json({ message: "Token không hợp lệ hoặc chưa đăng nhập." });
    }

    const { name, username, birthday, email } = req.body;
    if (!name || !username || !birthday || !email) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin." });
    }

    // ✅ Kiểm tra trùng email / username
    const emailExists = await User.findOne({
      email,
      _id: { $ne: req.user.userId },
    });
    if (emailExists) {
      return res.status(400).json({ message: "Email này đã được sử dụng." });
    }

    const usernameExists = await User.findOne({
      username,
      _id: { $ne: req.user.userId },
    });
    if (usernameExists) {
      return res
        .status(400)
        .json({ message: "Tên đăng nhập này đã được sử dụng." });
    }

    // ✅ Cập nhật thông tin
    const updatedUser = await User.findByIdAndUpdate(
      req.user.userId,
      { name, username, birthday, email },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    return res.json({
      message: "Cập nhật hồ sơ thành công.",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật hồ sơ:", err);
    return res
      .status(500)
      .json({
        message: "Lỗi máy chủ khi cập nhật thông tin.",
        error: err.message,
      });
  }
};

/**
 * 👥 Lấy danh sách toàn bộ người dùng (chỉ ADMIN)
 */
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập." });
    }

    const users = await User.find().select("-password");
    return res.json(users);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách người dùng:", err);
    return res.status(500).json({ message: "Lỗi máy chủ", error: err.message });
  }
};
