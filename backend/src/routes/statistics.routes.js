// src/routes/statistics.routes.js
import express from "express";
import {
  getVolunteerStatistics,
  getVolunteerStatisticsByMonth,
  getManagerStatistics,
  getManagerMonthlyStats,
  getRanking,
} from "../controllers/statistics.controller.js";
import { verifyToken, eventManager } from "../middlewares/auth.js";
import { getAllEventsForAllUsers } from "../controllers/statistics.controller.js";

const router = express.Router();

// =============================================================================
// ROUTES THỐNG KÊ (STATISTICS)
// =============================================================================

// --- VOLUNTEER STATISTICS ---

// [GET] /api/statistics/volunteer
// 📊 Thống kê tổng quan (Volunteer)
// - Chức năng: Xem tổng số sự kiện đã tham gia, tổng giờ làm, điểm số...
// - Trả về: Object thống kê.
router.get("/volunteer", verifyToken, getVolunteerStatistics);

// [GET] /api/statistics/volunteer/monthly
// 📅 Thống kê theo tháng (Volunteer)
// - Chức năng: Xem biểu đồ hoạt động theo từng tháng trong năm.
// - Trả về: Mảng dữ liệu theo tháng.
router.get("/volunteer/monthly", verifyToken, getVolunteerStatisticsByMonth);

// --- MANAGER STATISTICS ---

// [GET] /api/statistics/manager
// 📈 Thống kê tổng quan (Manager)
// - Chức năng: Xem tổng số sự kiện đã tổ chức, tổng người tham gia...
// - Trả về: Object thống kê quản lý.
router.get("/manager", verifyToken, eventManager, getManagerStatistics);

// [GET] /api/statistics/manager/monthly
// 📉 Thống kê theo tháng (Manager)
// - Chức năng: Xem xu hướng đăng ký sự kiện theo tháng.
// - Trả về: Mảng dữ liệu theo tháng.
router.get(
  "/manager/monthly",
  verifyToken,
  eventManager,
  getManagerMonthlyStats
);

// --- GENERAL STATISTICS ---

// [GET] /api/statistics/events
// 🌍 Thống kê sự kiện toàn hệ thống
// - Chức năng: Lấy số liệu về các sự kiện (dùng cho trang chủ hoặc báo cáo chung).
// - Trả về: Danh sách hoặc số liệu tổng hợp.
router.get("/events", verifyToken, getAllEventsForAllUsers);

// [GET] /api/statistics/ranking
// 🏆 Bảng xếp hạng
// - Chức năng: Xem top volunteer có điểm số/giờ làm cao nhất.
// - Trả về: Danh sách user xếp hạng cao.
router.get("/ranking", verifyToken, getRanking);

export default router;
