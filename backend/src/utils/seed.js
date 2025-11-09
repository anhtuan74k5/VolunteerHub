// src/utils/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import User from "../models/user.js";
import Event from "../models/event.js";
import Registration from "../models/registration.js";
import Otp from "../models/otp.js";

dotenv.config();
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/volunteerhub";

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    // 🧹 Xóa dữ liệu cũ
    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Registration.deleteMany({}),
      Otp.deleteMany({}),
    ]);
    console.log("🧹 Old data cleared");

    // 🔐 Tạo mật khẩu mặc định
    const password = await bcrypt.hash("123456", 10);

    // 👤 1️⃣ Users
    const users = await User.insertMany([
      {
        name: "Admin User",
        username: "admin",
        email: "admin@example.com",
        password,
        birthday: new Date("1990-01-01"),
        role: "ADMIN",
        status: "ACTIVE",
      },
      {
        name: "Event Manager 1",
        username: "manager1",
        email: "manager1@example.com",
        password,
        birthday: new Date("1991-03-10"),
        role: "EVENTMANAGER",
        status: "ACTIVE",
      },
      {
        name: "Event Manager 2",
        username: "manager2",
        email: "manager2@example.com",
        password,
        birthday: new Date("1992-05-15"),
        role: "EVENTMANAGER",
        status: "ACTIVE",
      },
      ...Array.from({ length: 7 }, (_, i) => ({
        name: `Volunteer ${i + 1}`,
        username: `volunteer${i + 1}`,
        email: `volunteer${i + 1}@example.com`,
        password,
        birthday: new Date(`2000-0${(i % 9) + 1}-15`),
        role: "VOLUNTEER",
        status: "ACTIVE",
      })),
    ]);
    console.log(`✅ Created ${users.length} users`);

    const admin = users[0];
    const managers = users.filter((u) => u.role === "EVENTMANAGER");
    const volunteers = users.filter((u) => u.role === "VOLUNTEER");

    // 📅 2️⃣ Events
    const events = await Event.insertMany([
      {
        name: "Chiến dịch Dọn rác biển",
        description: "Cùng chung tay làm sạch môi trường biển Cần Giờ.",
        date: new Date("2025-12-10"),
        location: "Bãi biển Cần Giờ",
        category: "Môi trường",
        status: "approved",
        createdBy: managers[0]._id,
      },
      {
        name: "Hiến máu nhân đạo",
        description: "Chương trình hiến máu cứu người do UET tổ chức.",
        date: new Date("2025-11-25"),
        location: "Trung tâm Hiến máu TP.HCM",
        category: "Sức khỏe",
        status: "pending",
        createdBy: managers[0]._id,
      },
      {
        name: "Chạy bộ gây quỹ",
        description: "Gây quỹ hỗ trợ học sinh nghèo vùng cao.",
        date: new Date("2025-08-15"),
        location: "Công viên Tao Đàn",
        category: "Từ thiện",
        status: "completed",
        createdBy: managers[1]._id,
      },
      {
        name: "Lớp học kỹ năng sống",
        description: "Đào tạo kỹ năng mềm cho học sinh tiểu học.",
        date: new Date("2025-10-05"),
        location: "Trường THCS Bình Minh",
        category: "Giáo dục",
        status: "approved",
        createdBy: managers[1]._id,
      },
    ]);
    console.log(`✅ Created ${events.length} events`);

    // 📋 3️⃣ Registrations (tự động tạo nhiều trạng thái khác nhau)
    const registrationData = [];
    volunteers.forEach((v, i) => {
      events.forEach((e, j) => {
        let status = "pending";
        if (j % 3 === 0) status = "approved";
        if (j % 4 === 0) status = "completed";
        if (i % 5 === 0 && j % 2 === 0) status = "canceled";

        registrationData.push({
          event: e._id,
          volunteer: v._id,
          status,
          cancelRequest: status === "approved" && Math.random() < 0.2,
        });
      });
    });

    await Registration.insertMany(registrationData);
    console.log(`✅ Created ${registrationData.length} registrations`);

    // 🔑 4️⃣ OTP mẫu
    await Otp.insertMany([
      {
        email: "volunteer1@example.com",
        otp: "123456",
        purpose: "REGISTER",
        expiresAt: new Date(Date.now() + 1000 * 60 * 10),
      },
    ]);
    console.log("✅ Created OTP");

    console.log("🎉 Database seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error seeding database:", err);
    process.exit(1);
  }
}

seed();
