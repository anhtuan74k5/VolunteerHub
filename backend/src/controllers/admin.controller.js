// src/controllers/admin.controller.js
import User from "../models/user.js";
import Event from "../models/event.js";
import Registration from "../models/registration.js";
import { Parser } from "json2csv"; // Cài thư viện: npm install json2csv

// =================================================================================================
// QUẢN LÝ SỰ KIỆN
// =================================================================================================

/**
 * @desc Lấy danh sách các sự kiện đang chờ duyệt
 * @route GET /api/admin/events/pending
 * @access Private (Admin)
 */
export const getPendingEvents = async (req, res) => {
  try {
    // Tìm các sự kiện có status là "pending" và populate thông tin người tạo
    const events = await Event.find({ status: "pending" }).populate(
      "createdBy",
      "name email"
    );
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Duyệt một sự kiện
 * @route PUT /api/admin/events/:id/approve
 * @access Private (Admin)
 */
export const approveEvent = async (req, res) => {
  try {
    // Tìm và cập nhật trạng thái sự kiện thành "approved"
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true } // Trả về document đã được cập nhật
    );
    if (!event)
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    res.status(200).json({ message: "Duyệt sự kiện thành công", event });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Xóa một sự kiện bởi Admin
 * @route DELETE /api/admin/events/:id
 * @access Private (Admin)
 */
export const deleteEventByAdmin = async (req, res) => {
  try {
    // Tìm và xóa sự kiện
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event)
      return res.status(404).json({ message: "Không tìm thấy sự kiện" });
    // TODO: Cân nhắc xóa các registration liên quan hoặc thông báo cho người dùng
    res.status(200).json({ message: "Xóa sự kiện thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Lấy tất cả sự kiện (có phân trang và lọc theo status)
 * @route GET /api/admin/events
 * @access Private (Admin)
 */
export const getAllEvents = async (req, res) => {
  try {
    const { status } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Tạo bộ lọc, nếu có status thì lọc theo status
    const filter = status ? { status } : {};

    // Lấy dữ liệu sự kiện phân trang
    const events = await Event.find(filter)
      .populate("createdBy", "name email")
      .skip((page - 1) * limit)
      .limit(limit);

    // Đếm tổng số document khớp với bộ lọc
    const total = await Event.countDocuments(filter);

    res.json({
      total,
      page,
      limit,
      events,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sự kiện",
      error: error.message,
    });
  }
};

// =================================================================================================
// QUẢN LÝ NGƯỜI DÙNG
// =================================================================================================

/**
 * @desc Lấy tất cả người dùng (có phân trang)
 * @route GET /api/admin/users
 * @access Private (Admin)
 */
export const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Lấy danh sách người dùng, bỏ qua mật khẩu
    const users = await User.find({})
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password");

    // Đếm tổng số người dùng
    const total = await User.countDocuments();

    res.status(200).json({
      total,
      page,
      limit,
      users,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Cập nhật trạng thái tài khoản (Khóa/Mở)
 * @route PUT /api/admin/users/:id/status
 * @access Private (Admin)
 */
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body; // "ACTIVE" hoặc "LOCKED"

    // Kiểm tra dữ liệu đầu vào
    if (!["ACTIVE", "LOCKED"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    // Tìm và cập nhật trạng thái người dùng
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

// =================================================================================================
// QUẢN LÝ ĐĂNG KÝ
// =================================================================================================

/**
 * @desc Lấy toàn bộ đăng ký (có phân trang)
 * @route GET /api/admin/registrations
 * @access Private (Admin)
 */
export const getAllRegistrations = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Lấy danh sách đăng ký, populate thông tin sự kiện và tình nguyện viên
    const regs = await Registration.find()
      .populate("event volunteer", "name email title")
      .skip((page - 1) * limit)
      .limit(limit);

    // Đếm tổng số đăng ký
    const total = await Registration.countDocuments();

    res.json({
      total,
      page,
      limit,
      registrations: regs,
    });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy danh sách đăng ký",
      error: error.message,
    });
  }
};

/**
 * @desc Phê duyệt yêu cầu hủy đăng ký bởi Admin
 * @route PUT /api/admin/registrations/:id/approve-cancel
 * @access Private (Admin)
 */
export const approveCancelByAdmin = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg)
      return res.status(404).json({ message: "Không tìm thấy đăng ký" });

    // Kiểm tra xem có yêu cầu hủy không
    if (!reg.cancelRequest) {
      return res.status(400).json({ message: "Không có yêu cầu hủy để duyệt" });
    }

    // Cập nhật trạng thái
    reg.status = "cancelled";
    reg.cancelRequest = false;
    await reg.save();

    res.json({ message: "✅ Đã duyệt hủy ở cấp admin" });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi duyệt hủy đăng ký",
      error: error.message,
    });
  }
};

// =================================================================================================
// DASHBOARD & THỐNG KÊ
// =================================================================================================

/**
 * @desc Lấy các số liệu thống kê chính cho dashboard của Admin
 * @route GET /api/admin/dashboard
 * @access Private (Admin)
 */
export const getDashboardStats = async (req, res) => {
  try {
    // Đếm song song để tối ưu hiệu suất
    const [totalUsers, totalEvents, pendingEventsCount, approvedEventsCount] =
      await Promise.all([
        User.countDocuments(),
        Event.countDocuments(),
        Event.countDocuments({ status: "pending" }),
        Event.countDocuments({ status: "approved" }),
      ]);

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

/**
 * @desc Thống kê số lượng sự kiện được tạo theo tháng
 * @route GET /api/admin/statistics/monthly?year=YYYY
 * @access Private (Admin)
 */
export const getMonthlyStatistics = async (req, res) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    if (isNaN(year)) {
      return res.status(400).json({ message: "Năm không hợp lệ" });
    }

    // Lấy tất cả sự kiện trong năm
    const events = await Event.find({
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    });

    // Khởi tạo mảng 12 tháng
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      events: 0,
    }));

    // Đếm số sự kiện cho mỗi tháng
    events.forEach((e) => monthly[new Date(e.createdAt).getMonth()].events++);

    res.json({ year, monthly });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi thống kê theo tháng", error: error.message });
  }
};

// =================================================================================================
// XUẤT DỮ LIỆU
// =================================================================================================

/**
 * @desc Xuất danh sách người dùng ra file CSV
 * @route GET /api/admin/export/users
 * @access Private (Admin)
 */
export const exportUsers = async (req, res) => {
  try {
    // Lấy tất cả dữ liệu người dùng, bỏ các trường không cần thiết
    const users = await User.find({}).select("-password -__v").lean();
    const json2csvParser = new Parser();
    const csv = json2csvParser.parse(users);

    // Thiết lập header để trình duyệt tải file về
    res.header("Content-Type", "text/csv");
    res.attachment("users-export.csv");
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
