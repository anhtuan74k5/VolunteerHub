// src/routes/post.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import Post from "../models/post.js";

const router = express.Router();

// =============================================================================
// ROUTES BÀI VIẾT (POSTS)
// =============================================================================

// [GET] /api/posts/event/:eventId
// 📰 Lấy danh sách bài viết của sự kiện
// - Chức năng: Xem tất cả bài đăng thảo luận trong một sự kiện.
// - Trả về: Danh sách bài viết (kèm thông tin người đăng, số like, comment).
router.get("/:eventId", async (req, res) => {
  try {
    const posts = await Post.find({ event: req.params.eventId })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({ message: "Lỗi khi lấy bài viết" });
  }
});

// [POST] /api/posts/:eventId
// ✍️ Đăng bài viết mới
// - Chức năng: Thành viên tham gia sự kiện đăng bài thảo luận/hỏi đáp.
// - Body yêu cầu: { "content": "...", "images": [...] }
// - Trả về: Bài viết vừa tạo.
router.post("/:eventId", verifyToken, async (req, res) => {
  try {
    const { content } = req.body;
    const { eventId } = req.params;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Nội dung không được để trống" });
    }

    const post = new Post({
      event: eventId,
      author: req.user._id,
      content: content.trim(),
      likes: [],
      commentCount: 0,
    });

    await post.save();
    await post.populate("author", "name avatar");

    res.status(201).json(post);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ message: "Lỗi khi tạo bài viết" });
  }
});

// [DELETE] /api/posts/:postId - Xóa bài viết
router.delete("/:postId", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Bài viết không tồn tại" });
    }

    if (post.author.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Không có quyền xóa bài viết này" });
    }

    await post.deleteOne();
    res.status(200).json({ message: "Xóa bài viết thành công" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Lỗi khi xóa bài viết" });
  }
});

export default router;
