import webpush from 'web-push';
import Subscription from '../models/subscription.js';
import Notification from '../models/notification.js';

// 1. Cấu hình VAPID keys (đọc từ .env)
webpush.setVapidDetails(
  'mailto:mr.tuanhoang84@gmail.com', // 👈 Bạn đã điền đúng email
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

/**
 * Hàm gửi Push Notification VÀ lưu vào DB
 * @param {string} userId - ID của người nhận
 * @param {string} type - 👈 SỬA: Loại thông báo (VD: "registration_approved")
 * @param {string} message - 👈 SỬA: Nội dung thông báo
 * @param {string} url - (Tùy chọn) Link để mở khi click
 */
export const sendPushNotification = async (userId, type, message, url = '/') => {
  try {
    // 1. TẠO THÔNG BÁO TRONG DB (ĐÃ SỬA CHO ĐÚNG MODEL)
    await Notification.create({
      user: userId,
      type: type,       // 👈 Sửa: Dùng 'type'
      message: message, // 👈 Sửa: Dùng 'message'
    });

    // 2. Lấy tất cả "địa chỉ" (subscriptions) của người dùng đó
    const userSubscriptions = await Subscription.find({ user: userId });
    
    // 3. Chuẩn bị payload (dùng 'message' làm 'body' cho pop-up)
    const payload = JSON.stringify({
      title: 'VolunteerHub Thông Báo', // 👈 Sửa: Tiêu đề chung cho pop-up
      body: message,                   // 👈 Sửa: Nội dung pop-up là 'message'
      icon: '/logo192.png', // Đường dẫn tới logo (frontend)
      data: {
        url: url // URL sẽ mở khi click
      }
    });

    // 4. Lặp qua từng "địa chỉ" và gửi push (logic này đã đúng)
    userSubscriptions.forEach(sub => {
      webpush.sendNotification(sub.toObject(), payload)
        .catch(err => {
          // Nếu lỗi 410 (Gone), tức là subscription đã cũ, xóa nó đi
          if (err.statusCode === 410) {
            Subscription.findByIdAndDelete(sub._id).exec();
          } else {
            console.error('Lỗi khi gửi push:', err);
          }
        });
    });

  } catch (error) {
    // Bắt lỗi nếu Notification.create thất bại (ví dụ: 'type' không có trong enum)
    console.error('Lỗi khi tạo thông báo trong DB:', error.message);
  }
};