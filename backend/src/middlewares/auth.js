import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Chưa đăng nhập." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Quan trọng: gán lại thành object có key userId để controller đọc đúng
    req.user = {
      userId: decoded.userId, // lấy từ payload khi login
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Token không hợp lệ." });
  }
};
