import EventAction from "../models/eventAction.js";
import Event from "../models/event.js";

// [POST] /api/events/:eventId/action
export const handleEventAction = async (req, res) => {
  try {
    const { type } = req.body;
    const eventId = req.params.eventId;
    const userId = req.user._id;

    if (!["LIKE", "SHARE", "VIEW"].includes(type)) {
      return res.status(400).json({ message: "Hành động không hợp lệ" });
    }

    const event = await Event.findById(eventId);
    if (!event)
      return res.status(404).json({ message: "Sự kiện không tồn tại" });

    // --- CASE 1: XỬ LÝ LIKE (Giữ nguyên) ---
    if (type === "LIKE") {
      const existingLike = await EventAction.findOne({
        user: userId,
        event: eventId,
        type: "LIKE",
      });
      if (existingLike) {
        await EventAction.findByIdAndDelete(existingLike._id);
        await Event.findByIdAndUpdate(eventId, { $inc: { likesCount: -1 } });
        return res.status(200).json({
          message: "Đã bỏ thích",
          liked: false,
          likesCount: event.likesCount - 1,
        });
      } else {
        await EventAction.create({
          user: userId,
          event: eventId,
          type: "LIKE",
        });
        await Event.findByIdAndUpdate(eventId, { $inc: { likesCount: 1 } });
        return res.status(200).json({
          message: "Đã thích",
          liked: true,
          likesCount: event.likesCount + 1,
        });
      }
    }

    // --- CASE 2: XỬ LÝ SHARE (Cập nhật logic trả về Link) ---
    if (type === "SHARE") {
      // 1. Ghi nhận hành động vào DB
      await EventAction.create({ user: userId, event: eventId, type: "SHARE" });
      await Event.findByIdAndUpdate(eventId, { $inc: { sharesCount: 1 } });

      // 2. Tạo link sự kiện
      // Lấy domain từ biến môi trường hoặc mặc định localhost
      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      const shareLink = `${clientUrl}/su-kien/${eventId}`;

      // 3. Trả về Link cho Frontend
      return res.status(200).json({
        message: "Đã ghi nhận chia sẻ",
        shareLink: shareLink,
      });
    }

    // --- CASE 3: XỬ LÝ VIEW (Giữ nguyên) ---
    if (type === "VIEW") {
      await EventAction.create({ user: userId, event: eventId, type: "VIEW" });
      await Event.findByIdAndUpdate(eventId, { $inc: { viewsCount: 1 } });
      return res.status(200).json({ message: "Đã tăng lượt xem" });
    }
  } catch (error) {
    console.error("Lỗi event action:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// [GET] /api/events/:eventId/status
// API này để Frontend kiểm tra xem user hiện tại đã Like sự kiện này chưa
export const getUserActionStatus = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const userId = req.user._id;

    const liked = await EventAction.exists({
      user: userId,
      event: eventId,
      type: "LIKE",
    });

    res.status(200).json({ hasLiked: !!liked });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] /api/actions/:eventId/stats
// 📊 API lấy số liệu thống kê + Link chia sẻ (Public)
export const getEventStats = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Chỉ lấy các trường số liệu cần thiết
    const event = await Event.findById(eventId).select(
      "likesCount sharesCount viewsCount"
    );

    if (!event) {
      return res.status(404).json({ message: "Sự kiện không tồn tại" });
    }

    const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const shareLink = `${clientUrl}/events/${eventId}`;

    res.status(200).json({
      likesCount: event.likesCount,
      sharesCount: event.sharesCount,
      viewsCount: event.viewsCount,
      shareLink: shareLink,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
