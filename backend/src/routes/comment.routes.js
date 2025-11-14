// src/routes/comment.routes.js
import express from 'express';
import { verifyToken } from '../middlewares/auth.js';
import {
  createComment,
  getPostComments,
  toggleLikeComment,
  deleteComment
} from '../controllers/comment.controller.js';

const router = express.Router();

// Tất cả các route này đều yêu cầu đăng nhập
router.use(verifyToken);

// Lấy tất cả comment của 1 post
router.get('/post/:postId', getPostComments);

// Tạo comment mới cho 1 post
router.post('/post/:postId', createComment);

// Xóa 1 comment
router.delete('/:commentId', deleteComment);

// Like/Unlike 1 comment
router.post('/:commentId/like', toggleLikeComment);

export default router;