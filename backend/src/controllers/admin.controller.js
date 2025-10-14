// src/controllers/admin.controller.js
import User from '../models/user.js';
import Event from '../models/event.js';
import { Parser } from 'json2csv'; // Cài thư viện: npm install json2csv

// --- QUẢN LÝ SỰ KIỆN ---

// [GET] /api/admin/events/pending -> Lấy các sự kiện chờ duyệt
export const getPendingEvents = async (req, res) => {
    try {
        const events = await Event.find({ status: 'pending' }).populate('createdBy', 'name email');
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [PUT] /api/admin/events/:id/approve -> Duyệt sự kiện
export const approveEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
        if (!event) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
        res.status(200).json({ message: 'Duyệt sự kiện thành công', event });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [DELETE] /api/admin/events/:id -> Xóa sự kiện
export const deleteEventByAdmin = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });
        res.status(200).json({ message: 'Xóa sự kiện thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- QUẢN LÝ NGƯỜI DÙNG ---

// [GET] /api/admin/users -> Lấy tất cả người dùng
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [PUT] /api/admin/users/:id/status -> Khóa/Mở tài khoản
export const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body; // Frontend gửi "ACTIVE" hoặc "LOCKED"
        const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        res.status(200).json({ message: 'Cập nhật trạng thái thành công', user });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- XUẤT DỮ LIỆU ---

// [GET] /api/admin/export/users -> Xuất file CSV người dùng
export const exportUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password -__v').lean();
        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(users);
        res.header('Content-Type', 'text/csv');
        res.attachment('users-export.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// --- DASHBOARD ---

// [GET] /api/admin/dashboard -> Lấy thống kê cho dashboard
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEvents = await Event.countDocuments();
        const pendingEventsCount = await Event.countDocuments({ status: 'pending' });
        const approvedEventsCount = await Event.countDocuments({ status: 'approved' });

        res.status(200).json({
            totalUsers,
            totalEvents,
            pendingEventsCount,
            approvedEventsCount
        });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};