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
    // 2. Đảm bảo Service Worker đã sẵn sàng (với retry)
    // Một số trường hợp SW chưa kịp register khi gọi subscribe (đăng nhập ngay khi trang tải),
    // nên ta thử chờ tối đa vài giây.
    let swRegistration = null;
    const maxAttempts = 6;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        swRegistration = await navigator.serviceWorker.ready;
        if (swRegistration) break;
      } catch (e) {
        console.warn(`⏳ [WebPush] Service Worker chưa ready (attempt ${attempt}/${maxAttempts})`);
      }
      // đợi 500ms trước khi thử lại
      await new Promise((r) => setTimeout(r, 500));
    }
    if (!swRegistration) {
      throw new Error("Service Worker chưa sẵn sàng sau nhiều lần thử.");
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
    // 5. Tạo Subscription (với retry)
    let subscription = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        subscription = await swRegistration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
        break;
      } catch (err) {
        console.warn(`⚠️ [WebPush] subscribe() thất bại (attempt ${attempt}/3):`, err && err.message ? err.message : err);
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    if (!subscription) throw new Error('Không thể tạo Push Subscription sau nhiều lần thử.');

    // 6. Gửi Subscription lên Server (thử nhiều lần nếu cần)
    console.log("📡 [WebPush] Đang gửi subscription lên server...");
    const subPayload = (typeof subscription.toJSON === 'function') ? subscription.toJSON() : subscription;
    console.log('📡 [WebPush] Subscription payload (truncated):', {
      endpoint: subPayload.endpoint && subPayload.endpoint.slice(0, 120),
      keys: subPayload.keys,
    });

    let lastErr = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const resp = await http.post('/notifications/subscribe', subPayload);
        console.log('📡 [WebPush] Server response:', resp?.data);
        console.log('✅ [WebPush] Đăng ký thành công! User sẽ nhận được thông báo.');
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        console.warn(`⚠️ [WebPush] Gửi subscription thất bại (attempt ${attempt}/3):`, err?.response?.status, err?.message || err);
        // Nếu 401, không retry (cần login/token)
        if (err?.response?.status === 401) break;
        await new Promise((r) => setTimeout(r, 700));
      }
    }

    if (lastErr) {
      // In chi tiết để nhà phát triển dễ debug
      console.error('❌ [WebPush] Không thể lưu subscription sau nhiều lần thử:', lastErr?.response?.data || lastErr?.message || lastErr);
      // Thêm hướng dẫn nhanh cho dev
      if (lastErr?.response?.status === 401) {
        console.error('👉 [Gợi ý] Token có thể chưa được lưu vào localStorage trước khi gọi subscribe. Hãy đảm bảo đăng ký push được gọi sau khi login hoàn tất.');
      }
    }

  } catch (error) {
    console.error('❌ [WebPush] Lỗi khi đăng ký:', error);
    // Gợi ý debug nếu gặp lỗi 401
    if (error.response?.status === 401) {
        console.error("👉 Gợi ý: Token chưa được lưu vào localStorage kịp thời, hoặc BaseUrl.js chưa đọc đúng key token.");
    }
  }
};