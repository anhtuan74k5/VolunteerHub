// =================================================================================================
// Import các module cần thiết
// =================================================================================================
import express from "express"; // Framework web chính
import dotenv from "dotenv"; // Để quản lý biến môi trường từ file .env
import cors from "cors"; // Middleware để xử lý Cross-Origin Resource Sharing
import { connectDB } from "./config/db.js"; // Hàm kết nối đến MongoDB

// =================================================================================================
// Import các file routes
// =================================================================================================
import authRoutes from "./routes/auth.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import eventRoutes from "./routes/event.routes.js";
import registrationRoutes from "./routes/registration.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import statisticsRoutes from "./routes/statistics.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =================================================================================================
// Cấu hình và khởi tạo Express App
// =================================================================================================
dotenv.config(); // Tải các biến môi trường từ file .env
const app = express(); // Tạo một instance của Express

// =================================================================================================
// Middlewares
// =================================================================================================
// Cho phép frontend (chạy trên domain khác) có thể gọi đến API này
app.use(cors());
// Middleware để phân tích body của request dưới dạng JSON
app.use(express.json());

// =================================================================================================
// Kết nối cơ sở dữ liệu
// =================================================================================================
await connectDB();

// =================================================================================================
// Định nghĩa Routes
// =================================================================================================
// Route cơ bản để kiểm tra API có hoạt động không
app.get("/", (req, res) => {
  res.send("✅ VolunteerHub Backend API is running...");
});

// Gắn các routes vào ứng dụng với tiền tố tương ứng
app.use("/api/auth", authRoutes); // Routes xác thực người dùng
app.use("/api/admin", adminRoutes); // Routes cho admin
app.use("/api/events", eventRoutes); // Routes quản lý sự kiện
app.use("/api/registrations", registrationRoutes); // Routes quản lý đăng ký
app.use("/api/dashboard", dashboardRoutes); // Routes cho dashboard
app.use("/api/statistics", statisticsRoutes); // Routes cho thống kê
app.use("/api/notifications", notificationRoutes); // Routes cho thông báo
// Tạo route ảo /uploads để trỏ vào thư mục /uploads thật
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// =================================================================================================
// Xử lý lỗi 404 - Route không tồn tại
// =================================================================================================
// Middleware này sẽ được gọi khi không có route nào khớp với request
app.use((req, res) => {
  res.status(404).json({ message: "❌ API route not found" });
});

// =================================================================================================
// Khởi động Server
// =================================================================================================
const PORT = process.env.PORT || 5000; // Lấy port từ biến môi trường hoặc mặc định là 5000
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
