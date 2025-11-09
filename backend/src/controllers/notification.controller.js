// src/controllers/notification.controller.js
import Notification from "../models/notification.js";

/**
 * @desc Lấy tất cả thông báo của người dùng hiện tại
 * @route GET /api/notifications
 * @access Private
 */
export const getMyNotifications = async (req, res) => {
  try {
    // Tìm tất cả thông báo cho user ID hiện tại, sắp xếp theo thời gian mới nhất
    const notifications = await Notification.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    // Trả về danh sách thông báo
    res.json(notifications);
  } catch (error) {
    // Xử lý lỗi nếu có
    res
      .status(500)
      .json({ message: "Lỗi khi lấy thông báo", error: error.message });
  }
};

/**
 * @desc Đánh dấu một thông báo là đã đọc
 * @route PUT /api/notifications/:id/read
 * @access Private
 */
export const markAsRead = async (req, res) => {
  try {
    // Tìm thông báo bằng ID từ URL
    const notif = await Notification.findById(req.params.id);
    // Nếu không tìm thấy, trả về lỗi 404
    if (!notif)
      return res.status(404).json({ message: "Không tìm thấy thông báo" });

    // Cập nhật trạng thái isRead thành true
    notif.isRead = true;
    // Lưu thay đổi vào cơ sở dữ liệu
    await notif.save();
    // Trả về thông báo thành công
    res.json({ message: "Đã đánh dấu là đã đọc" });
  } catch (error) {
    // Xử lý lỗi nếu có
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
