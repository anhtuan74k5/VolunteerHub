// src/controllers/post.controller.js
import Post from '../models/post.model.js';
import Event from '../models/event.js';

// Tạo post mới
export const createPost = async (req, res) => {
  try {
    const { eventId, content } = req.body;

    console.log('📝 [Backend] Create post request:', { eventId, content, userId: req.user._id });

    // ✅ Validate input
    if (!eventId) {
      return res.status(400).json({ message: 'eventId là bắt buộc' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ message: 'content là bắt buộc' });
    }

    const post = new Post({
      event: eventId, // ✅ Đảm bảo field event được set
      author: req.user._id,
      content: content.trim(),
      commentCount: 0, // ✅ Khởi tạo commentCount = 0
    });

    await post.save();
    await post.populate('author', 'name avatar');

    console.log('✅ Post created successfully:', post._id);
    res.status(201).json(post);
  } catch (error) {
    console.error('❌ Error creating post:', error);
    res.status(400).json({ message: error.message });
  }
};

// Lấy posts của event
export const getEventPosts = async (req, res) => {
  try {
    const { eventId } = req.params;

    const posts = await Post.find({ event: eventId })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error('❌ Error getting posts:', error);
    res.status(500).json({ message: error.message });
  }
};

// Xóa post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post không tồn tại' });
    }

    // Chỉ author hoặc ADMIN mới xóa được
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Không có quyền xóa post này' });
    }

    await post.deleteOne();
    res.status(200).json({ message: 'Xóa post thành công' });
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    res.status(400).json({ message: error.message });
  }
};

// Toggle like post
export const toggleLikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: 'Post không tồn tại' });
    }

    const userId = req.user._id.toString();
    const likeIndex = post.likes.findIndex((id) => id.toString() === userId);

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
    } else {
      // Like
      post.likes.push(req.user._id);
    }

    await post.save();
    res.status(200).json(post);
  } catch (error) {
    console.error('❌ Error toggling like:', error);
    res.status(400).json({ message: error.message });
  }
};