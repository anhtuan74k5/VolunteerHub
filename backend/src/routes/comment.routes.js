// src/routes/comment.routes.js
import express from "express";
import { verifyToken } from "../middlewares/auth.js";
import Comment from "../models/comment.model.js";
import Post from "../models/post.model.js";

const router = express.Router();

// Tạo comment mới
router.post("/", verifyToken, async (req, res) => {
  try {
    const { postId, content } = req.body;

    if (!postId || !content) {
      return res.status(400).json({ message: "postId và content là bắt buộc" });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post không tồn tại" });
    }

    const comment = new Comment({
      post: postId,
      author: req.user._id,
      content: content.trim(),
    });

    await comment.save();
    // ✅ Populate author TRƯỚC KHI trả về
    await comment.populate("author", "name avatar");

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $inc: { commentCount: 1 } },
      { new: true }
    );

    console.log("✅ Comment created, commentCount:", updatedPost.commentCount);

    // ✅ Trả về comment đã populate
    res.status(201).json({
      comment,
      updatedPost: {
        _id: updatedPost._id,
        commentCount: updatedPost.commentCount,
      },
    });
  } catch (error) {
    console.error("❌ Error creating comment:", error);
    res.status(400).json({ message: error.message });
  }
});

// Lấy comments của post
router.get("/:postId", async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate("author", "name avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Xóa comment
router.delete("/:commentId", verifyToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment không tồn tại" });
    }

    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Không có quyền xóa comment này" });
    }

    await comment.deleteOne();

    // ✅ QUAN TRỌNG: Giảm commentCount và SAVE vào database
    await Post.findByIdAndUpdate(
      comment.post,
      { $inc: { commentCount: -1 } },
      { new: true } // ✅ Return document sau khi update
    );

    console.log("✅ Comment deleted and commentCount updated");
    res.status(200).json({ message: "Xóa comment thành công" });
  } catch (error) {
    console.error("❌ Error deleting comment:", error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
