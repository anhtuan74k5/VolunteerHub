// src/controllers/notification.controller.js
import Notification from "../models/notification.js";
import Subscription from "../models/subscription.js";
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

/**
 * @desc Đăng ký nhận thông báo (lưu subscription object)
 * @route POST /api/notifications/subscribe
 * @access Private
 */
export const subscribe = async (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.user._id;

    // 2. Tìm và cập nhật (hoặc tạo mới)
    // Dùng 'endpoint' làm key duy nhất để tránh trùng lặp
    await Subscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        user: userId,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
      },
      { upsert: true } // 👈 Tự động tạo nếu chưa tồn tại
    );

    res.status(201).json({ message: "Đăng ký nhận thông báo thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi đăng ký thông báo", error: error.message });
  }
};