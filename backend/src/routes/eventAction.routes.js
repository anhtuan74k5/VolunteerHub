import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  handleEventAction,
  getUserActionStatus,
  getEventStats,
} from "../controllers/eventAction.controller.js";

const router = express.Router();

// =============================================================================
// ROUTES TƯƠNG TÁC SỰ KIỆN (EVENT ACTIONS)
// =============================================================================

// [POST] /api/actions/:eventId
// 🖱️ Thực hiện hành động tương tác với sự kiện
// - Chức năng:
//    + LIKE: Thả tim hoặc Bỏ tim (Toggle).
//    + VIEW: Tăng lượt xem (cộng dồn).
//    + SHARE: Tăng lượt chia sẻ và TRẢ VỀ LINK sự kiện.
// - Body yêu cầu: { "type": "LIKE" } hoặc { "type": "SHARE" }, { "type": "VIEW" }
router.post("/:eventId", verifyToken, handleEventAction);

// [GET] /api/actions/:eventId/status
// 🔍 Kiểm tra trạng thái tương tác của User hiện tại
// - Chức năng: Kiểm tra xem User đã Like sự kiện này chưa.
// - Trả về: { "hasLiked": true } hoặc { "hasLiked": false }
// - Mục đích Frontend: Để tô đỏ nút "Tim" nếu user đã like trước đó.
router.get("/:eventId/status", verifyToken, getUserActionStatus);

// [GET] /api/actions/:eventId/stats
// 📊 Lấy dữ liệu thống kê tương tác (Public API)
// - Chức năng: Lấy tổng số lượt Tim, Chia sẻ và Xem hiện tại của sự kiện.
// - Trả về: { "likesCount": 10, "sharesCount": 5, "viewsCount": 100 }
// - Mục đích Frontend: Dùng để Auto-reload (Polling) số liệu trên giao diện mà không cần tải lại toàn bộ trang.
router.get("/:eventId/stats", getEventStats);

export default router;
