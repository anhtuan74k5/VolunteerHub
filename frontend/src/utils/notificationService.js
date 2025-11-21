import { http } from "./BaseUrl";

/**
 * Hàm chuyển đổi VAPID key (Base64) sang định dạng Uint8Array
 * Bắt buộc cho PushManager của trình duyệt
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
 * Hàm chính: Đăng ký nhận thông báo Web Push
 * 1. Kiểm tra hỗ trợ trình duyệt & Service Worker
 * 2. Xin quyền thông báo
 * 3. Lấy subscription object từ trình duyệt (dùng VAPID Key)
 * 4. Gửi subscription lên server (API /subscribe)
 */
export const subscribeUserToPush = async () => {
  console.log("🔔 [WebPush] Bắt đầu quy trình đăng ký...");

  // 1. Kiểm tra trình duyệt
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('⚠️ [WebPush] Trình duyệt không hỗ trợ Push Messaging.');
    return;
  }

  try {
    // 2. Kiểm tra Service Worker đã sẵn sàng chưa
    // (File service-worker.js phải được register thành công trước đó)
    const swRegistration = await navigator.serviceWorker.ready;
    if (!swRegistration) {
        throw new Error("Service Worker chưa sẵn sàng (ready).");
    }

    // 3. Xin quyền thông báo (Nếu chưa có)
    const permission = await window.Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('⚠️ [WebPush] Người dùng đã từ chối quyền thông báo.');
      return;
    }

    // 4. Lấy VAPID Key: ưu tiên biến môi trường Vite, nếu không có -> gọi API backend
    let vapidPublicKey = import.meta.env?.VITE_VAPID_PUBLIC_KEY;

    if (!vapidPublicKey) {
      try {
        console.log('📡 [WebPush] Lấy VAPID Public Key từ server...');
        // Sử dụng instance http để áp dụng baseURL và Authorization nếu cần
        const resp = await http.get('/notifications/vapidPublicKey');
        vapidPublicKey = resp.data?.publicKey;
      } catch (err) {
        console.error('❌ [WebPush] Không thể lấy VAPID key từ server:', err);
        throw new Error("Thiếu VAPID public key (không tìm thấy trong env hoặc từ server)");
      }
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // 5. Tạo Subscription (Lấy địa chỉ trình duyệt)
    // Trình duyệt sẽ dùng VAPID Key này để giao tiếp với Push Service (Google/Mozilla)
    const subscription = await swRegistration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey,
    });

    // 6. Gửi Subscription lên Server
    // Dùng instance 'http' để tự động đính kèm Token từ localStorage (nhờ BaseUrl.js)
    console.log("📡 [WebPush] Đang gửi subscription lên server...");
      // Some browsers return a PushSubscription object with methods; ensure we send plain JSON
      const subPayload = (typeof subscription.toJSON === 'function')
        ? subscription.toJSON()
        : subscription;
      console.log('📡 [WebPush] Subscription payload:', subPayload);
      const resp = await http.post('/notifications/subscribe', subPayload);
      console.log('📡 [WebPush] Server response:', resp?.data);
    
    console.log('✅ [WebPush] Đăng ký thành công! User sẽ nhận được thông báo.');

  } catch (error) {
    console.error('❌ [WebPush] Lỗi khi đăng ký:', error);
    // Gợi ý debug nếu gặp lỗi 401
    if (error.response?.status === 401) {
        console.error("👉 Gợi ý: Token chưa được lưu vào localStorage kịp thời, hoặc BaseUrl.js chưa đọc đúng key token.");
    }
  }
};