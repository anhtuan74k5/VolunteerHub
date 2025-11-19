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

// =================================================================================================
// Routes cho Thống kê Volunteer (Yêu cầu xác thực token)
// =================================================================================================

// [GET] /api/statistics/volunteer
// 📊 Lấy thống kê tổng quan cho volunteer
router.get("/volunteer", verifyToken, getVolunteerStatistics);

// [GET] /api/statistics/volunteer/monthly
// 📅 Lấy thống kê hoạt động theo tháng cho volunteer
router.get("/volunteer/monthly", verifyToken, getVolunteerStatisticsByMonth);

// =================================================================================================
// Routes cho Thống kê Manager (Yêu cầu xác thực token và quyền manager)
// =================================================================================================

// [GET] /api/statistics/manager
// 📊 Lấy thống kê tổng quan cho manager
router.get("/manager", verifyToken, eventManager, getManagerStatistics);

// [GET] /api/statistics/manager/monthly
// 📅 Lấy thống kê đăng ký theo tháng cho manager
router.get(
  "/manager/monthly",
  verifyToken,
  eventManager,
  getManagerMonthlyStats
);

//[GET] /api/statistics/events
// Lấy tất cả sự kiện cho tất cả người dùng
router.get("/events", verifyToken, getAllEventsForAllUsers);

// [GET] /api/statistics/ranking
// Xem bảng xếp hạng (Yêu cầu đăng nhập)
router.get("/ranking", verifyToken, getRanking);

export default router;
