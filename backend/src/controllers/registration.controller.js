import Registration from "../models/registration.js";
import Event from "../models/event.js";
import User from "../models/user.js";
import { sendPushNotification } from "../utils/sendPush.js";
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

    // 2. 👇 KIỂM TRA SỐ LƯỢNG
    // Đếm số lượng người đã đăng ký (cả 'pending' và 'approved')
    const currentParticipants = await Registration.countDocuments({
      event: eventId,
      status: { $in: ["approved"] }, // Đếm cả 2 trạng thái
    });

    if (currentParticipants >= event.maxParticipants) {
      return res.status(409).json({
        // 409 Conflict
        message: "Rất tiếc, sự kiện này đã đủ số lượng người tham gia.",
      });
    }

    // 3. Tạo đăng ký mới (Giữ nguyên)
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
      // Công thức: (Ngày sự kiện - Ngày hiện tại) / (ms * giây * phút * giờ)
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
export const getEventRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({
      event: req.params.eventId,
    }).populate("volunteer", "name email");
    res.status(200).json(registrations);
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

    // Nếu status là 'approved' thì gửi push/notification tới volunteer
    if (updatedReg && status === "approved") {
      try {
        const volunteerId = updatedReg.volunteer;
        const message = "Yêu cầu đăng ký của bạn đã được chấp thuận.";
        const url = `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/my-registrations`;
        // Fire-and-forget (log on error)
        sendPushNotification(
          volunteerId,
          "registration_approved",
          message,
          url
        ).catch((err) =>
          console.error("sendPushNotification error (approved):", err)
        );
      } catch (err) {
        console.error("Error triggering push on approve:", err);
      }
    }
    // Nếu status là 'rejected' thì gửi push/notification tới volunteer
    if (updatedReg && status === "rejected") {
      try {
        const volunteerId = updatedReg.volunteer;
        const message = "Rất tiếc, yêu cầu đăng ký của bạn đã bị từ chối.";
        const url = `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/my-registrations`;
        sendPushNotification(
          volunteerId,
          "registration_rejected",
          message,
          url
        ).catch((err) =>
          console.error("sendPushNotification error (rejected):", err)
        );
      } catch (err) {
        console.error("Error triggering push on reject:", err);
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
// [PUT] /api/registrations/:registrationId/complete
// Body: { "performance": "GOOD" | "AVERAGE" | "BAD" | "NO_SHOW" }
export const markAsCompleted = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { performance } = req.body; // Lấy đánh giá từ Frontend gửi lên

    // 1. Validate input
    const validPerformance = ["GOOD", "AVERAGE", "BAD", "NO_SHOW"];
    // Nếu không gửi performance lên thì mặc định là GOOD (hoặc trả lỗi tùy bạn)
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

    // Kiểm tra nếu đã hoàn thành rồi thì không cộng điểm lại
    if (registration.status === "completed") {
      return res
        .status(400)
        .json({ message: "Đơn này đã được đánh dấu hoàn thành trước đó." });
    }

    const eventPoints = registration.event.points || 0; // Điểm gốc của sự kiện
    let pointsToAdd = 0;
    let statusToUpdate = "completed"; // Mặc định là hoàn thành

    // 3. Tính điểm dựa trên mức độ hoàn thành
    switch (rating) {
      case "GOOD": // Tốt: 100% điểm
        pointsToAdd = eventPoints;
        break;
      case "AVERAGE": // Trung bình: 1/2 điểm (lấy phần nguyên)
        pointsToAdd = Math.floor(eventPoints / 2);
        break;
      case "BAD": // Tệ: 1/5 điểm (lấy phần nguyên)
        pointsToAdd = Math.floor(eventPoints / 5);
        break;
      case "NO_SHOW": // Không tham gia: Trừ 10 điểm
        pointsToAdd = -10;
        // Nếu không tham gia thì có thể set status là "canceled" hoặc vẫn "completed" để ghi nhận manager đã xử lý.
        // Ở đây mình để "completed" để đánh dấu là quy trình duyệt đã xong, nhưng điểm bị trừ.
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

    // 5. Cập nhật trạng thái Registration
    registration.status = statusToUpdate;
    // Nếu bạn muốn lưu lại đánh giá vào DB, bạn cần thêm trường "performance" vào Registration Model trước
    // registration.performance = rating;
    await registration.save();

    res.status(200).json({
      message: `Đã đánh giá ${rating}. User được ${
        pointsToAdd > 0 ? "+" : ""
      }${pointsToAdd} điểm.`,
      registration,
    });

    // 6. Gửi thông báo (Notification)
    if (registration) {
      try {
        const volunteerId = registration.volunteer;
        let message = "";

        // Tùy chỉnh nội dung thông báo
        if (rating === "NO_SHOW") {
          message = `Bạn bị trừ 10 điểm vì không tham gia sự kiện ${registration.event.name}.`;
        } else {
          message = `Chúc mừng! Bạn nhận được ${pointsToAdd} điểm từ sự kiện ${registration.event.name} (Đánh giá: ${rating}).`;
        }

        const url = `${
          process.env.CLIENT_URL || "http://localhost:5173"
        }/my-registrations`;

        // Gọi hàm sendPushNotification của bạn (giả sử đã import)
        // sendPushNotification(volunteerId, 'registration_approved', message, url).catch(...)
        console.log(`🔔 Gửi thông báo tới ${volunteerId}: ${message}`);
      } catch (err) {
        console.error("Error triggering push on complete:", err);
      }
    }
  } catch (error) {
    console.error("❌ Lỗi markAsCompleted:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
