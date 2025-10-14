import express from 'express';
import { admin, verifyToken } from '../middlewares/auth.js';
import {
    getPendingEvents,
    approveEvent,
    deleteEventByAdmin,
    getAllUsers,
    updateUserStatus,
    exportUsers,
    getDashboardStats
} from '../controllers/admin.controller.js';

const router = express.Router();

// Áp dụng middleware cho TẤT CẢ các route trong file này
// Bất kỳ ai truy cập các API này đều phải đăng nhập VÀ là Admin
router.use(verifyToken, admin);

// Routes cho Quản lý Sự kiện
router.get('/events/pending', getPendingEvents);
router.put('/events/:id/approve', approveEvent);
router.delete('/events/:id', deleteEventByAdmin);

// Routes cho Quản lý Người dùng
router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);

// Route cho Xuất Dữ liệu
router.get('/export/users', exportUsers);

// Route cho Dashboard
router.get('/dashboard', getDashboardStats);

export default router;