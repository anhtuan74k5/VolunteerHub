import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import otpRoutes from "./routes/otp.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import eventRoutes from './routes/event.routes.js';
import registrationRoutes from "./routes/registration.routes.js";

dotenv.config();
const app = express();

// ✅ Middleware cơ bản
app.use(cors()); // Cho phép frontend gọi API từ domain khác (vd: localhost:3000)
app.use(express.json()); // Để đọc body JSON từ request

// ✅ Kết nối MongoDB
await connectDB();

// ✅ Test route đơn giản (tùy chọn)
app.get("/", (req, res) => {
  res.send("✅ VolunteerHub Backend API is running...");
});

// ✅ Khai báo route API chính
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/registrations', registrationRoutes);

// ✅ Xử lý route không tồn tại
app.use((req, res) => {
  res.status(404).json({ message: "❌ API route not found" });
});

// ✅ Khởi động server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
