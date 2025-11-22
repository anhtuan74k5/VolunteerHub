// src/controllers/registration.controller.js
import Registration from "../models/registration.js";
import Event from "../models/event.js";
import User from "../models/user.js";
import { sendPushNotification } from "../utils/sendPush.js"; // Đảm bảo đường dẫn import đúng

// --- Chức năng cho Volunteer ---

// [POST] /api/registrations/:eventId -> Volunteer đăng ký sự kiện
export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const volunteerId = req.user._id;

    // 1. Kiểm tra sự kiện
    const event = await Event.findById(eventId);
    if (!event || event.status !== "approved") {
      return res
        .status(404)
        .json({ message: "Sự kiện không tồn tại hoặc chưa được duyệt." });
    }

    // 2. KIỂM TRA SỐ LƯỢNG
    const currentParticipants = await Registration.countDocuments({
      event: eventId,
      status: { $in: ["approved"] },
    });

    if (currentParticipants >= event.maxParticipants) {
      return res.status(409).json({
        message: "Rất tiếc, sự kiện này đã đủ số lượng người tham gia.",
      });
    }

    // 3. Tạo đăng ký mới
    const newRegistration = new Registration({
      event: eventId,
      volunteer: volunteerId,
    });
    await newRegistration.save();
    res.status(201).json({
      message: "Đăng ký thành công, vui lòng chờ duyệt",
      registration: newRegistration,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Bạn đã đăng ký sự kiện này rồi." });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [DELETE] /api/registrations/:eventId -> Hủy đăng ký (Có trừ điểm nếu sát giờ)
export const cancelRegistration = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const volunteerId = req.user._id;

    // 1. Tìm đơn đăng ký
    const registration = await Registration.findOne({
      event: eventId,
      volunteer: volunteerId,
    });

    if (!registration) {
      return res.status(404).json({ message: "Bạn chưa đăng ký sự kiện này." });
    }

    // 2. Kiểm tra thời gian để trừ điểm
    const event = await Event.findById(eventId);
    let penaltyMessage = "";

    if (event) {
      const now = new Date();
      const eventDate = new Date(event.date);

      // Tính khoảng cách thời gian ra ngày
      const diffTime = eventDate - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Nếu còn ít hơn hoặc bằng 2 ngày -> Trừ 10 điểm
      if (diffDays <= 2) {
        await User.findByIdAndUpdate(volunteerId, { $inc: { points: -10 } });
        penaltyMessage = " (Bạn bị trừ 10 điểm uy tín do hủy sát ngày diễn ra)";
      }
    }

    // 3. Xóa đăng ký
    await Registration.findByIdAndDelete(registration._id);

    res.status(200).json({
      message: "Hủy đăng ký thành công." + penaltyMessage,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [GET] /api/registrations/history -> Volunteer xem lịch sử
export const getMyHistory = async (req, res) => {
  try {
    const history = await Registration.find({ volunteer: req.user._id })
      .populate("event", "name date status")
      .sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// --- Chức năng cho Event Manager ---

// [GET] /api/registrations/:eventId/participants -> Manager xem danh sách đăng ký
// CẬP NHẬT: Trả về thêm thông tin điểm thưởng và đánh giá nếu đã hoàn thành
export const getEventRegistrations = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // 1. Lấy thông tin sự kiện để biết điểm chuẩn (event.points)
    const event = await Event.findById(eventId).select("points status");
    if (!event) {
      return res.status(404).json({ message: "Sự kiện không tồn tại" });
    }

    // 2. Lấy danh sách đăng ký
    const registrations = await Registration.find({ event: eventId })
      .populate("volunteer", "name email avatar phone")
      .lean(); // Dùng lean() để dễ dàng gán thêm trường mới

    // 3. Tính toán thông tin đánh giá cho từng người để hiển thị
    const results = registrations.map((reg) => {
      let evaluation = "Chưa đánh giá";
      let pointsAwarded = 0;

      // Chỉ tính toán hiển thị nếu đơn đăng ký đã hoàn thành và có performance
      if (reg.status === "completed") {
        const eventPoints = event.points || 0;

        if (reg.performance) {
          evaluation = reg.performance;
          switch (reg.performance) {
            case "GOOD":
              pointsAwarded = eventPoints;
              break;
            case "AVERAGE":
              pointsAwarded = Math.floor(eventPoints / 2);
              break;
            case "BAD":
              pointsAwarded = Math.floor(eventPoints / 5);
              break;
            case "NO_SHOW":
              pointsAwarded = -10;
              break;
            default:
              pointsAwarded = eventPoints;
          }
        } else {
          // Trường hợp completed cũ chưa có performance (tương thích ngược)
          evaluation = "Đã hoàn thành";
          pointsAwarded = eventPoints;
        }
      }

      return {
        ...reg,
        evaluation, // Hiển thị: GOOD, AVERAGE...
        pointsAwarded, // Hiển thị số điểm: 35, 17, -10...
      };
    });

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [PUT] /api/registrations/:registrationId/status -> Manager duyệt/hủy đăng ký
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' hoặc 'rejected'
    const updatedReg = await Registration.findByIdAndUpdate(
      req.params.registrationId,
      { status },
      { new: true }
    );
    res.status(200).json({
      message: "Cập nhật trạng thái thành công",
      registration: updatedReg,
    });

    // Thông báo
    if (updatedReg) {
      const volunteerId = updatedReg.volunteer;
      const clientUrl = process.env.CLIENT_URL || "http://localhost:3000";
      const url = `${clientUrl}/my-registrations`;

      if (status === "approved") {
        sendPushNotification(
          volunteerId,
          "registration_approved",
          "Yêu cầu đăng ký của bạn đã được chấp thuận.",
          url
        ).catch((err) => console.error("Push error (approved):", err));
      } else if (status === "rejected") {
        sendPushNotification(
          volunteerId,
          "registration_rejected",
          "Rất tiếc, yêu cầu đăng ký của bạn đã bị từ chối.",
          url
        ).catch((err) => console.error("Push error (rejected):", err));
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// [PUT] /api/registrations/:registrationId/complete
// Body: { "performance": "GOOD" | "AVERAGE" | "BAD" | "NO_SHOW" }
// CẬP NHẬT: Lưu performance vào DB và gửi thông báo
export const markAsCompleted = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { performance } = req.body;

    // 1. Validate input
    const validPerformance = ["GOOD", "AVERAGE", "BAD", "NO_SHOW"];
    const rating = validPerformance.includes(performance)
      ? performance
      : "GOOD";

    // 2. Tìm Registration và populate Event để lấy điểm gốc
    const registration = await Registration.findById(registrationId).populate(
      "event"
    );

    if (!registration) {
      return res.status(404).json({ message: "Không tìm thấy đơn đăng ký." });
    }

    if (registration.status === "completed") {
      return res
        .status(400)
        .json({ message: "Đơn này đã được đánh dấu hoàn thành trước đó." });
    }

    const eventPoints = registration.event.points || 0;
    let pointsToAdd = 0;

    // 3. Tính điểm dựa trên mức độ hoàn thành
    switch (rating) {
      case "GOOD":
        pointsToAdd = eventPoints;
        break;
      case "AVERAGE":
        pointsToAdd = Math.floor(eventPoints / 2);
        break;
      case "BAD":
        pointsToAdd = Math.floor(eventPoints / 5);
        break;
      case "NO_SHOW":
        pointsToAdd = -10;
        break;
      default:
        pointsToAdd = eventPoints;
    }

    // 4. Cập nhật điểm cho Volunteer
    if (pointsToAdd !== 0) {
      await User.findByIdAndUpdate(registration.volunteer, {
        $inc: { points: pointsToAdd },
      });
    }

    // 5. Cập nhật trạng thái và Lưu đánh giá
    registration.status = "completed";
    registration.performance = rating;

    const updatedReg = await registration.save();

    res.status(200).json({
      message: `Đã đánh giá ${rating}. User nhận ${pointsToAdd} điểm.`,
      registration: updatedReg,
    });

    // 6. Gửi thông báo
    if (updatedReg) {
      try {
        const volunteerId = updatedReg.volunteer;
        let message = "";

        if (rating === "NO_SHOW") {
          message = `Bạn bị trừ 10 điểm vì không tham gia sự kiện ${registration.event.name}.`;
        } else {
          message = `Chúc mừng! Bạn nhận được ${pointsToAdd} điểm từ sự kiện ${registration.event.name} (Đánh giá: ${rating}).`;
        }

        const url = `${
          process.env.CLIENT_URL || "http://localhost:3000"
        }/my-registrations`;

        sendPushNotification(volunteerId, "registration_approved", url).catch(
          (err) => console.error("Push error (completed):", err)
        );
      } catch (err) {
        console.error("Error triggering push on complete:", err);
      }
    }
  } catch (error) {
    console.error("❌ Lỗi markAsCompleted:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
