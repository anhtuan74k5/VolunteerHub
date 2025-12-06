import Comment from '../models/comment.model.js';
import Post from '../models/post.model.js';

// Tạo comment mới
export const createComment = async (postId, userId, content) => {
  const comment = new Comment({
    post: postId,
    author: userId,
    content
  });

  await comment.save();

  // Populate author info
  await comment.populate('author', 'name avatar');

  // Tăng commentCount của post
  await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

  return comment;
};

// Lấy comments của post
export const getCommentsByPost = async (postId) => {
  return await Comment.find({ post: postId })
    .populate('author', 'name avatar')
    .sort({ createdAt: -1 });
};

// Xóa comment
export const deleteComment = async (commentId, userId, userRole) => {
  const comment = await Comment.findById(commentId);
  
  if (!comment) {
    throw new Error('Comment không tồn tại');
  }

  // Chỉ author hoặc ADMIN mới xóa được
  if (comment.author.toString() !== userId && userRole !== 'ADMIN') {
    throw new Error('Không có quyền xóa comment này');
  }

  await comment.deleteOne();

  // Giảm commentCount của post
  await Post.findByIdAndUpdate(comment.post, { $inc: { commentCount: -1 } });

  return { message: 'Xóa comment thành công' };
};
