import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  handleEventAction,
  getUserActionStatus,
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

export default router;
