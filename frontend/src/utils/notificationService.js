// src/utils/notificationService.js
import { http } from "../utils/BaseUrl"; // 👈 Dùng 'http' service của bạn

/**
 * Hàm chuyển đổi VAPID key (Base64) sang định dạng Uint8Array
 * Bắt buộc cho PushManager
 */
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Hàm chính: Đăng ký nhận thông báo
 */
export const subscribeUserToPush = async () => {
  // 1. Kiểm tra trình duyệt có hỗ trợ không
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return;
  }

  try {
    // 2. Lấy Service Worker
    const swRegistration = await navigator.serviceWorker.ready;

    // 3. Xin phép người dùng
    const permission = await window.Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permission for notifications was denied');
      return;
    }

    // 4. Lấy VAPID key từ .env
    const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('VAPID public key is not defined in .env');
      return;
    }
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // 5. Lấy "địa chỉ" (subscription)
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    // 6. Gửi "địa chỉ" này lên backend
    // Dùng 'http.post' (từ BaseUrl.js) để nó tự đính kèm token
    await http.post('/api/notifications/subscribe', subscription);
    
    console.log('User subscribed successfully.');

  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
  }
};