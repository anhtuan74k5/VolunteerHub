import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Otp from "../models/otp.js"; // 👈 Thêm import
import { generateOtp } from "../utils/generateOtp.js"; // 👈 Thêm import
import { sendOtpEmail } from "../utils/sendMail.js"; // 👈 Thêm import


// --- ĐĂNG KÝ (Sử dụng OTP) ---

// 📩 Gửi OTP Đăng ký
export const sendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Vui lòng nhập email." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email đã được sử dụng." });

    const otp = generateOtp();
    await Otp.create({
      email,
      otp,
      purpose: "REGISTER",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 phút
    });

    await sendOtpEmail(email, otp, "Đăng ký tài khoản VolunteerHub");
    res.status(200).json({ message: "OTP đăng ký đã được gửi đến email." });
  } catch (err) {
    console.error("❌ Lỗi trong sendRegisterOtp:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// ✅ Xác thực OTP & Tạo tài khoản
export const verifyAndRegister = async (req, res) => {
  try {
    const { email, name, username, birthday, password, otp } = req.body;

    // 1. Kiểm tra OTP
    const record = await Otp.findOne({ email, otp, purpose: "REGISTER" });
    if (!record) return res.status(400).json({ message: "OTP không hợp lệ." });
    if (record.expiresAt < new Date())
      return res.status(400).json({ message: "OTP đã hết hạn." });

    // 2. ✅ LOGIC VALIDATE NGÀY SINH (Đã thêm)
    const birthDate = new Date(birthday);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    birthDate.setHours(0, 0, 0, 0);

    if (birthDate >= today) {
      return res
        .status(400)
        .json({ message: "Ngày sinh không hợp lệ." });
    }
    const tenYearsAgo = new Date();
    tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);
    if (birthDate > tenYearsAgo) {
      return res
        .status(400)
        .json({ message: "Bạn phải lớn hơn 10 tuổi để đăng ký." });
    }

    // 3. Tạo User
    const hashed = await bcrypt.hash(password, 10);
    await User.create({ email, name, username, birthday, password: hashed });

    // 4. Xóa OTP đã dùng
    await Otp.deleteMany({ email, purpose: "REGISTER" });
    res.status(201).json({ message: "Tài khoản đã được tạo thành công." });
  } catch (err) {
    console.error("❌ Lỗi trong verifyAndRegister:", err);
    // Bắt lỗi trùng username/email (nếu có)
    if (err.code === 11000) {
       return res.status(400).json({ message: "Email hoặc Tên đăng nhập đã tồn tại." });
    }
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};


// --- ĐĂNG NHẬP VÀ QUẢN LÝ HỒ SƠ ---
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


// --- QUÊN MẬT KHẨU ---

// 📩 Gửi OTP Reset Mật khẩu
export const sendResetOtp = async (req, res) => {
  try {
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

    await sendOtpEmail(email, otp, "Khôi phục mật khẩu VolunteerHub");
    res.status(200).json({ message: "OTP khôi phục mật khẩu đã được gửi." });
  } catch (err) {
    console.error("❌ Lỗi trong sendResetOtp:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// 🔑 Reset Mật khẩu bằng OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const record = await Otp.findOne({ email, otp, purpose: "RESET" });
    if (!record) return res.status(400).json({ message: "OTP không hợp lệ." });
    if (record.expiresAt < new Date())
      return res.status(400).json({ message: "OTP đã hết hạn." });
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findOneAndUpdate({ email }, { password: hashed });

    await Otp.deleteMany({ email, purpose: "RESET" });
    res.status(200).json({ message: "Mật khẩu đã được cập nhật thành công." });
  } catch (err) {
    console.error("❌ Lỗi trong resetPassword:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};



/**
 * 🔒 Thay đổi mật khẩu (khi người dùng đã đăng nhập)
 */
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    
    // 1. Lấy userId từ middleware 'verifyToken'
    // Lưu ý: Dùng req.user._id (vì verifyToken mới đã gán đầy đủ user)
    const userId = req.user._id; 

    // 2. Kiểm tra dữ liệu đầu vào
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập mật khẩu cũ và mới." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu mới phải có ít nhất 6 ký tự." });
    }

    // 3. Lấy thông tin user (lần này cần lấy cả password)
    // .select('+password') là cần thiết nếu bạn đã ẩn password trong schema
    const user = await User.findById(userId).select('+password');
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    // 4. Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu cũ không chính xác." });
    }

    // 5. Băm và lưu mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save(); // Lưu lại user với mật khẩu mới

    return res.status(200).json({ message: "Đổi mật khẩu thành công." });
  } catch (err) {
    console.error("❌ Lỗi khi thay đổi mật khẩu:", err);
    return res.status(500).json({ message: "Lỗi server", error: err.message });
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
