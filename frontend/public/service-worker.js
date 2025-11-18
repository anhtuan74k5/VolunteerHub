// public/service-worker.js
// File này sẽ xử lý các sự kiện 'push' (thông báo)

self.addEventListener('push', (event) => {
  // Lấy dữ liệu payload từ thông báo
  const data = event.data ? event.data.json() : {};

  const title = data.title || 'Thông báo mới';
  const options = {
    body: data.body || 'Bạn có một tin nhắn mới.',
    icon: data.icon || '/logo192.png', // Đường dẫn tới icon của bạn
    badge: data.badge || '/logo192.png',
    data: {
      url: data.data?.url || '/', // URL để mở khi click
    },
  };

  // Hiển thị thông báo
  event.waitUntil(self.registration.showNotification(title, options));
});

// Xử lý khi người dùng click vào thông báo
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Đóng thông báo
  
  // Mở tab mới với URL đã được truyền vào
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});