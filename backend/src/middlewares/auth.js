import jwt from "jsonwebtoken";
import User from '../models/user.js'; // Đảm bảo bạn đã import User model

export const verifyToken = async (req, res, next) => { // 1. Thêm "async"
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Chưa đăng nhập." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 2. Dùng userId từ token để tìm người dùng đầy đủ trong DB
    // và gán vào req.user. Giờ req.user sẽ có _id, name, email, role...
    req.user = await User.findById(decoded.userId).select('-password');
    
    // Nếu không tìm thấy user (ví dụ: user đã bị xóa)
    if (!req.user) {
        return res.status(401).json({ message: "Người dùng không tồn tại." });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};


export const admin = (req, res, next) => {
  if (req.user && req.user.role.toUpperCase() === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Forbidden: Yêu cầu quyền Admin' });
  }
};


export const eventManager = (req, res, next) => {
    // 3. Sửa lại tên role cho đúng với model
    const userRole = req.user.role.toUpperCase();
    if (userRole === 'EVENTMANAGER' || userRole === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ message: 'Forbidden: Yêu cầu quyền Quản lý Sự kiện' });
    }
};

// Thêm import ở đầu file
import Registration from '../models/registration.js';

// ... (code của verifyToken, admin, eventManager) ...

// 🛡️ Middleware kiểm tra xem user có phải là thành viên đã được duyệt của sự kiện không
export const isEventMember = async (req, res, next) => {
  try {
    const eventId = req.params.eventId || req.body.eventId; // Lấy eventId từ param hoặc body
    const userId = req.user._id;

    // Kiểm tra xem có phải Manager của sự kiện không (Manager luôn có quyền)
    if (req.user.role === 'EVENTMANAGER' || req.user.role === 'ADMIN') {
        return next(); 
    }

    // Kiểm tra xem có phải là Volunteer đã được 'approved'
    const registration = await Registration.findOne({
      event: eventId,
      volunteer: userId,
      status: 'approved',
    });

    if (registration) {
      return next(); // Là thành viên, cho phép
    }

    res.status(403).json({ message: 'Forbidden: Bạn phải là thành viên đã được duyệt của sự kiện này.' });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};