import Otp from "../models/otp.js";
import User from "../models/user.js";
import bcrypt from "bcrypt";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtpEmail } from "../utils/sendMail.js";

// 📩 Send OTP for registration
export const sendRegisterOtp = async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ message: "Email đã được sử dụng." });

  const otp = generateOtp();
  await Otp.create({
    email,
    otp,
    purpose: "REGISTER",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendOtpEmail(email, otp);
  res.json({ message: "OTP đăng ký đã được gửi đến email." });
};

// ✅ Verify OTP & create account
export const verifyRegisterOtp = async (req, res) => {
  const { email, name, username, birthday, password, otp } = req.body;

  const record = await Otp.findOne({ email, otp, purpose: "REGISTER" });
  if (!record) return res.status(400).json({ message: "OTP không hợp lệ." });
  if (record.expiresAt < new Date())
    return res.status(400).json({ message: "OTP đã hết hạn." });

  const hashed = await bcrypt.hash(password, 10);
  await User.create({ email, name, username, birthday, password: hashed });

  await Otp.deleteMany({ email, purpose: "REGISTER" });
  res.json({ message: "Tài khoản đã được tạo thành công." });
};

// 📩 Send OTP for password reset
export const sendResetOtp = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "Email không tồn tại." });

  const otp = generateOtp();
  await Otp.create({
    email,
    otp,
    purpose: "RESET",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await sendOtpEmail(email, otp);
  res.json({ message: "OTP khôi phục mật khẩu đã được gửi." });
};

// 🔑 Reset password
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const record = await Otp.findOne({ email, otp, purpose: "RESET" });
  if (!record) return res.status(400).json({ message: "OTP không hợp lệ." });
  if (record.expiresAt < new Date())
    return res.status(400).json({ message: "OTP đã hết hạn." });

  const hashed = await bcrypt.hash(newPassword, 10);
  await User.findOneAndUpdate({ email }, { password: hashed });

  await Otp.deleteMany({ email, purpose: "RESET" });
  res.json({ message: "Mật khẩu đã được cập nhật thành công." });
};
