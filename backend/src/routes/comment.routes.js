// src/routes/comment.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  createComment,
  getPostComments,
  toggleLikeComment,
  deleteComment,
} from "../controllers/comment.controller.js";

const router = express.Router();

// =============================================================================
// ROUTES BÌNH LUẬN (COMMENTS)
// =============================================================================

// Tất cả các route này đều yêu cầu đăng nhập
router.use(verifyToken);

// [GET] /api/comments/post/:postId
// 💬 Lấy danh sách bình luận của bài viết
// - Chức năng: Lấy tất cả comment (cấp 1) của một bài post cụ thể.
// - Trả về: Danh sách comment kèm thông tin người viết.
router.get("/post/:postId", getPostComments);

// [POST] /api/comments/post/:postId
// ✍️ Viết bình luận mới
// - Chức năng: User đăng bình luận vào bài viết.
// - Body yêu cầu: { "content": "Nội dung bình luận..." }
// - Trả về: Object Comment vừa tạo.
router.post("/post/:postId", createComment);

// [DELETE] /api/comments/:commentId
// 🗑️ Xóa bình luận
// - Chức năng: User xóa comment của mình hoặc Admin/Manager xóa comment vi phạm.
// - Trả về: Thông báo thành công.
router.delete("/:commentId", deleteComment);

// [POST] /api/comments/:commentId/like
// ❤️ Thả tim bình luận
// - Chức năng: Toggle like (Like/Unlike) cho một comment.
// - Trả về: Số lượng like mới và trạng thái hasLiked.
router.post("/:commentId/like", toggleLikeComment);

export default router;
