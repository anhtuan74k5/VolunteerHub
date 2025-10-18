// src/controllers/event.controller.js
import Event from '../models/event.js';
import Joi from 'joi';

// Schema để validate dữ liệu đầu vào khi tạo/sửa sự kiện
const eventSchema = Joi.object({
    name: Joi.string().min(3).required(),
    description: Joi.string().min(10).required(),
    date: Joi.date().iso().required(),
    location: Joi.string().required(),
    category: Joi.string().required()
});

// [POST] /api/events -> Tạo sự kiện mới
export const createEvent = async (req, res) => {
    try {
        const { error, value } = eventSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ', details: error.details });
        }

        const newEvent = new Event({
            ...value,
            createdBy: req.user._id, // Gắn ID của người tạo (lấy từ middleware verifyToken)
            status: 'pending', // Mặc định chờ Admin duyệt
        });

        await newEvent.save();
        res.status(201).json({ message: 'Tạo sự kiện thành công, đang chờ duyệt', event: newEvent });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [PUT] /api/events/:id -> Cập nhật sự kiện
export const updateEvent = async (req, res) => {
    try {
        const { error, value } = eventSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: 'Dữ liệu không hợp lệ', details: error.details });
        }

        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });

        // Chỉ người tạo sự kiện mới có quyền sửa
        if (event.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa sự kiện này' });
        }
        
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, value, { new: true });
        res.status(200).json({ message: 'Cập nhật sự kiện thành công', event: updatedEvent });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [DELETE] /api/events/:id -> Xóa sự kiện
export const deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Không tìm thấy sự kiện' });

        // Chỉ người tạo sự kiện hoặc Admin mới có quyền xóa
        const userRole = req.user.role.toUpperCase();
        if (event.createdBy.toString() !== req.user._id.toString() && userRole !== 'ADMIN') {
            return res.status(403).json({ message: 'Bạn không có quyền xóa sự kiện này' });
        }

        await Event.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Xóa sự kiện thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};




// [GET] /api/events/public -> Lấy danh sách sự kiện đã được duyệt
export const getApprovedEvents = async (req, res) => {
    try {
        const { category, date } = req.query; // Nhận tham số lọc từ URL
        
        const filter = { status: 'approved' };

        if (category) {
            filter.category = category;
        }
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            filter.date = { $gte: startDate, $lt: endDate };
        }

        const events = await Event.find(filter)
            .sort({ date: 1 })
            .populate('createdBy', 'name'); // Lấy tên người tạo
            
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// [GET] /api/events/public/:id -> Xem chi tiết một sự kiện
export const getEventDetails = async (req, res) => {
    try {
        const event = await Event.findOne({ _id: req.params.id, status: 'approved' })
            .populate('createdBy', 'name');
            
        if (!event) {
            return res.status(404).json({ message: 'Không tìm thấy sự kiện hoặc sự kiện chưa được duyệt.' });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};


// [GET] /api/events/my-events -> Manager xem các sự kiện do mình tạo
export const getMyEvents = async (req, res) => {
    try {
        // Lấy tất cả sự kiện có createdBy bằng ID của user đang đăng nhập
        const events = await Event.find({ createdBy: req.user._id })
            .sort({ createdAt: -1 }); // Sắp xếp mới nhất lên đầu
            
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};