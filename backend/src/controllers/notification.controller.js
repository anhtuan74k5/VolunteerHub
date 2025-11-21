// src/controllers/notification.controller.js
import Notification from "../models/notification.js";
import Subscription from "../models/subscription.js";
import mongoose from 'mongoose';

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
 * @desc Trả về VAPID public key cho frontend (nếu cần)
 * @route GET /api/notifications/vapidPublicKey
 * @access Public
 */
export const getVapidPublicKey = (req, res) => {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY || null;
    if (!publicKey) {
      return res.status(404).json({ message: 'VAPID public key not configured on server' });
    }
    res.json({ publicKey });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving VAPID key', error: error.message });
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


export const saveSubscription = async (req, res) => {
  try {
    const { endpoint, keys } = req.body;

    // Kiểm tra đầu vào
    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return res.status(400).json({ 
        message: "Thiếu thông tin subscription (endpoint hoặc keys)" 
      });
    }

    // Kiểm tra xem subscription này đã tồn tại chưa
    const existingSub = await Subscription.findOne({ 
      user: req.user._id, 
      endpoint 
    });

    if (existingSub) {
      return res.json({ 
        message: "Subscription đã tồn tại", 
        subscription: existingSub 
      });
    }

    // Tạo mới subscription
    const newSubscription = await Subscription.create({
      user: req.user._id,
      endpoint,
      keys,
    });

    console.log(`✅ Đã lưu subscription cho user: ${req.user.email}`);
    res.status(201).json({ 
      message: "Đăng ký nhận thông báo thành công", 
      subscription: newSubscription 
    });

  } catch (error) {
    console.error("❌ Lỗi khi lưu subscription:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lưu subscription", 
      error: error.message 
    });
  }
};