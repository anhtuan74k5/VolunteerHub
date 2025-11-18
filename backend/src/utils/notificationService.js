// src/utils/notificationService.js
import { http } from "../utils/BaseUrl"; // 👈 SỬA: Dùng 'http' thay vì 'axios'

/**
 * Hàm chuyển đổi VAPID key (Base64) sang định dạng Uint8Array
 */
function urlBase64ToUint8Array(base64String) {
  // ... (code này giữ nguyên)
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
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push messaging is not supported');
    return;
  }

  try {
    const swRegistration = await navigator.serviceWorker.ready;
    const permission = await window.Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permission for notifications was denied');
      return;
    }

    const vapidPublicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('VAPID public key is not defined in .env');
      return;
    }
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    // 6. Gửi "địa chỉ" này lên backend
    // 👇 SỬA: Dùng 'http.post' thay vì 'axios.post'
    // 'http' sẽ tự động đính kèm token (vì nó có interceptor)
    await http.post('/api/notifications/subscribe', subscription);
    
    console.log('User subscribed successfully.');

  } catch (error) {
    console.error('Failed to subscribe the user: ', error);
  }
};