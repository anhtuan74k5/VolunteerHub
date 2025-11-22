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

    // --- CASE 1: LIKE (Logic Toggle - Giữ nguyên) ---
    if (type === "LIKE") {
      const existingLike = await EventAction.findOne({
        user: userId,
        event: eventId,
        type: "LIKE",
      });
      let updatedEvent;

      if (existingLike) {
        await EventAction.findByIdAndDelete(existingLike._id);
        updatedEvent = await Event.findByIdAndUpdate(
          eventId,
          { $inc: { likesCount: -1 } },
          { new: true }
        );
        return res.status(200).json({
          message: "Đã bỏ thích",
          liked: false,
          likesCount: updatedEvent.likesCount,
          sharesCount: updatedEvent.sharesCount,
        });
      } else {
        await EventAction.create({
          user: userId,
          event: eventId,
          type: "LIKE",
        });
        updatedEvent = await Event.findByIdAndUpdate(
          eventId,
          { $inc: { likesCount: 1 } },
          { new: true }
        );
        return res.status(200).json({
          message: "Đã thích",
          liked: true,
          likesCount: updatedEvent.likesCount,
          sharesCount: updatedEvent.sharesCount,
        });
      }
    }

    // --- CASE 2: SHARE (Sửa logic: Chỉ tính 1 lần) ---
    if (type === "SHARE") {
      // 1. Tạo link chia sẻ trước
      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      const shareLink = `${clientUrl}/events/${eventId}`;

      // 2. Kiểm tra xem user đã share chưa
      const existingShare = await EventAction.findOne({
        user: userId,
        event: eventId,
        type: "SHARE",
      });

      // A. Nếu đã share rồi -> Trả về link nhưng KHÔNG tăng count
      if (existingShare) {
        return res.status(200).json({
          message: "Bạn đã chia sẻ sự kiện này rồi (Lấy lại link)",
          shareLink: shareLink,
          likesCount: event.likesCount,
          sharesCount: event.sharesCount, // Giữ nguyên số cũ
        });
      } else {
        // B. Nếu chưa share -> Tạo log mới và TĂNG count
        await EventAction.create({
          user: userId,
          event: eventId,
          type: "SHARE",
        });

        const updatedEvent = await Event.findByIdAndUpdate(
          eventId,
          { $inc: { sharesCount: 1 } },
          { new: true }
        );

        return res.status(200).json({
          message: "Đã ghi nhận chia sẻ lần đầu",
          shareLink: shareLink,
          likesCount: updatedEvent.likesCount,
          sharesCount: updatedEvent.sharesCount,
        });
      }
    }

    // --- CASE 3: VIEW (Giữ nguyên: View thì vẫn cộng dồn) ---
    if (type === "VIEW") {
      await EventAction.create({ user: userId, event: eventId, type: "VIEW" });
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $inc: { viewsCount: 1 } },
        { new: true }
      );

      return res.status(200).json({
        message: "Đã tăng lượt xem",
        viewsCount: updatedEvent.viewsCount,
        likesCount: updatedEvent.likesCount,
        sharesCount: updatedEvent.sharesCount,
      });
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
