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