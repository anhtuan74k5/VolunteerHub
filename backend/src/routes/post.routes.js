// src/routes/post.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import {
  createPost,
  getEventPosts,
  deletePost,
  toggleLikePost,
} from "../controllers/post.controller.js";

const router = express.Router();

// =============================================================================
// ROUTES BÀI VIẾT (POSTS)
// =============================================================================

// [POST] /api/posts
// ✍️ Đăng bài viết mới
// - Chức năng: Thành viên tham gia sự kiện đăng bài thảo luận/hỏi đáp.
// - Body yêu cầu: { "content": "...", "images": [...] }
// - Trả về: Bài viết vừa tạo.
router.post("/", verifyToken, createPost);

// [GET] /api/posts/event/:eventId
// 📰 Lấy danh sách bài viết của sự kiện
// - Chức năng: Xem tất cả bài đăng thảo luận trong một sự kiện.
// - Trả về: Danh sách bài viết (kèm thông tin người đăng, số like, comment).
router.get("/event/:eventId", getEventPosts);

// [POST] /api/posts/:postId/like
// ❤️ Thả tim bài viết
// - Chức năng: Toggle like (Like/Unlike) cho một bài viết.
// - Trả về: Số lượng like mới và trạng thái hasLiked.
router.post("/:postId/like", verifyToken, toggleLikePost);

// ✅ [DELETE] /api/posts/:postId - Xóa bài viết
router.delete("/:postId", verifyToken, deletePost);

export default router;
