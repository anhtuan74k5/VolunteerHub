// src/controllers/auth.controller.js
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

// ✅ Đăng nhập
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu." });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại." });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ message: "Mật khẩu không chính xác." });

    if (user.status !== "ACTIVE")
      return res.status(403).json({ message: "Tài khoản đang bị khóa." });

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
        role: user.role,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ✅ Lấy thông tin người dùng hiện tại
export const getMe = async (req, res) => {
  try {
    const me = await User.findById(req.user.userId).select("-password");
    if (!me)
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    return res.json(me);
  } catch (err) {
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
