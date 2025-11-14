// src/routes/post.routes.js
import express from 'express';
import { verifyToken, isEventMember } from '../middlewares/auth.js';
import { getEventPosts, createPost, toggleLikePost } from '../controllers/post.controller.js';

const router = express.Router();

// Lấy tất cả bài post (Ai cũng xem được, chỉ cần đăng nhập)
router.get('/event/:eventId', verifyToken, getEventPosts);

// Tạo bài post (Phải là thành viên đã được duyệt)
router.post('/event/:eventId', verifyToken, isEventMember, createPost);

// Like/Unlike bài post (Phải là thành viên đã được duyệt)
// (Middleware isEventMember cần được điều chỉnh để lấy eventId từ post)
// Tạm thời chỉ cần verifyToken
router.post('/:postId/like', verifyToken, toggleLikePost); 

export default router;