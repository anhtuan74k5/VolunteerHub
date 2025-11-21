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

    // Tìm subscription theo endpoint (có thể đã tồn tại và gắn với user khác)
    const existingByEndpoint = await Subscription.findOne({ endpoint });

    if (existingByEndpoint) {
      // Nếu subscription đã tồn tại nhưng thuộc về user khác -> gán lại cho user hiện tại
      if (String(existingByEndpoint.user) !== String(req.user._id)) {
        existingByEndpoint.user = req.user._id;
        existingByEndpoint.keys = keys; // cập nhật keys nếu có thay đổi
        await existingByEndpoint.save();
        console.log(`🔁 Reassigned subscription endpoint to user: ${req.user.email}`);
        return res.status(200).json({ message: 'Subscription transferred to current user', subscription: existingByEndpoint });
      }

      // Nếu subscription đã tồn tại và cùng user -> trả về thông báo đã tồn tại
      return res.json({ message: 'Subscription đã tồn tại', subscription: existingByEndpoint });
    }

    // Nếu chưa tồn tại endpoint nào -> tạo mới
    const newSubscription = await Subscription.create({
      user: req.user._id,
      endpoint,
      keys,
    });

    console.log(`✅ Đã lưu subscription cho user: ${req.user.email}`);
    res.status(201).json({ message: 'Đăng ký nhận thông báo thành công', subscription: newSubscription });

  } catch (error) {
    console.error("❌ Lỗi khi lưu subscription:", error);
    res.status(500).json({ 
      message: "Lỗi server khi lưu subscription", 
      error: error.message 
    });
  }
};

/**
 * @desc Lấy tất cả subscription (push endpoints) của user hiện tại
 * @route GET /api/notifications/subscriptions
 * @access Private
 */
export const getMySubscriptions = async (req, res) => {
  try {
    const subs = await Subscription.find({ user: req.user._id }).select('-__v');
    return res.json({ subscriptions: subs });
  } catch (error) {
    console.error('❌ Lỗi khi lấy subscriptions:', error);
    return res.status(500).json({ message: 'Lỗi server khi lấy subscriptions', error: error.message });
  }
};

/**
 * @desc Trigger a test push for the logged-in user (protected)
 * @route POST /api/notifications/test
 * @access Private
 */
export const testPushForMe = async (req, res) => {
  try {
    const userId = req.user._id;
    // Fire send and return immediately so client doesn't wait long
    sendPushNotification(userId, 'test', 'Test push: bạn đã nhận được thông báo thử nghiệm', '/').catch(err => console.error('testPush send error:', err));
    return res.json({ message: 'Test push initiated' });
  } catch (error) {
    console.error('❌ Error initiating test push:', error);
    return res.status(500).json({ message: 'Lỗi server khi gửi test push', error: error.message });
  }
};