import Registration from "../models/registration.js";
import Event from "../models/event.js";
import { sendPushNotification } from '../utils/sendPush.js';

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
    // (Kiểm tra xem model 'Event' của bạn đã có 'maxParticipants' chưa)
    if (event.maxParticipants) {
      const currentParticipants = await Registration.countDocuments({
        event: eventId,
        status: { $in: ["approved", "pending"] },
      });
  
      if (currentParticipants >= event.maxParticipants) {
        return res.status(409).json({
          message: "Rất tiếc, sự kiện này đã đủ số lượng người tham gia.",
        });
      }
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

// ... (các hàm cancelRegistration, getMyHistory, getEventRegistrations giữ nguyên) ...
// [DELETE] /api/registrations/:eventId -> Volunteer hủy đăng ký
export const cancelRegistration = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const volunteerId = req.user._id;
    const result = await Registration.findOneAndDelete({
      event: eventId,
      volunteer: volunteerId,
    });
    if (!result) {
      return res.status(404).json({ message: "Bạn chưa đăng ký sự kiện này." });
    }
    res.status(200).json({ message: "Hủy đăng ký thành công." });
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
    const registration = await Registration.findById(req.params.registrationId)
                                            .populate('event', 'name'); 

    if (!registration) {
       return res.status(404).json({ message: "Không tìm thấy đơn đăng ký" });
    }

    registration.status = status;
    await registration.save();
    
    // 👇 SỬA LẠI CÁCH GỌI HÀM
    if (status === 'approved') {
      sendPushNotification(
        registration.volunteer,
        "registration_approved", // 👈 'type'
        `Bạn đã được duyệt tham gia sự kiện "${registration.event.name}".` // 👈 'message'
      );
    } else if (status === 'rejected') {
      sendPushNotification(
        registration.volunteer, 
        "registration_rejected", // 👈 'type'
        `Rất tiếc, đơn tham gia sự kiện "${registration.event.name}" của bạn đã bị từ chối.` // 👈 'message'
      );
    }
    // --- Hết phần kích hoạt ---

    res.status(200).json({ message: 'Cập nhật trạng thái thành công', registration });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};

// [PUT] /api/registrations/:registrationId/complete -> Manager đánh dấu hoàn thành
export const markAsCompleted = async (req, res) => {
  try {
    const registration = await Registration.findByIdAndUpdate(
        req.params.registrationId,
        { status: 'completed' },
        { new: true }
    ).populate('event', 'name'); 

    if (!registration) {
       return res.status(404).json({ message: "Không tìm thấy đơn đăng ký" });
    }

    // 👇 SỬA LẠI CÁCH GỌI HÀM
    sendPushNotification(
      registration.volunteer, 
      "registration_completed", // 👈 'type'
      `Chúc mừng bạn đã hoàn thành sự kiện "${registration.event.name}". Cảm ơn sự đóng góp của bạn!` // 👈 'message'
    );
    // --- Hết phần kích hoạt ---
    
    res.status(200).json({ message: 'Đánh dấu hoàn thành thành công', registration });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};