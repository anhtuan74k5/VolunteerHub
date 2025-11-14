// src/controllers/post.controller.js
import Post from '../models/post.js';

// [GET] /api/posts/event/:eventId -> Lấy tất cả bài post của 1 sự kiện
export const getEventPosts = async (req, res) => {
  try {
    const posts = await Post.find({ event: req.params.eventId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [POST] /api/posts/event/:eventId -> Tạo bài post mới
export const createPost = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Nội dung không được để trống." });
    }

    const newPost = new Post({
      content,
      author: req.user._id,
      event: req.params.eventId,
    });

    await newPost.save();
    // Populate thông tin author để trả về cho frontend hiển thị ngay
    const populatedPost = await newPost.populate('author', 'name avatar');
    res.status(201).json(populatedPost);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [POST] /api/posts/:postId/like -> Like hoặc Unlike một bài post
export const toggleLikePost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Không tìm thấy bài đăng." });
    }

    // Kiểm tra xem user đã like bài post này chưa
    const hasLiked = post.likes.includes(userId);

    if (hasLiked) {
      // Nếu đã like -> Unlike (xóa ID khỏi mảng)
      await post.updateOne({ $pull: { likes: userId } });
    } else {
      // Nếu chưa like -> Like (thêm ID vào mảng)
      await post.updateOne({ $push: { likes: userId } });
    }

    res.status(200).json({ message: "Cập nhật like thành công." });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};