// src/config/db.js
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // ✅ In ra thông tin kết nối chi tiết
    console.log("✅ MongoDB connected");
    console.log("📍 Host:", conn.connection.host);
    console.log("📁 Database name:", conn.connection.name); // 👈 tên database thực tế
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};
