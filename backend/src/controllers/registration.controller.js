import Registration from "../models/registration.js";
import Event from "../models/event.js";

// =================================================================================================
// Chức năng cho Volunteer
// =================================================================================================

/**
 * @desc Volunteer đăng ký tham gia một sự kiện
 * @route POST /api/registrations/:eventId
 * @access Private (Volunteer)
 */
export const registerForEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const volunteerId = req.user._id;

    // Kiểm tra sự kiện có tồn tại và đã được duyệt chưa
    const event = await Event.findById(eventId);
    if (!event || event.status !== "approved") {
      return res
        .status(404)
        .json({ message: "Sự kiện không tồn tại hoặc chưa được duyệt." });
    }

    // Tạo một đơn đăng ký mới
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
    // Xử lý lỗi unique key (đăng ký trùng)
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Bạn đã đăng ký sự kiện này rồi." });
    }
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Volunteer hủy đăng ký (khi chưa được duyệt)
 * @route DELETE /api/registrations/:eventId
 * @access Private (Volunteer)
 */
export const cancelRegistration = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const volunteerId = req.user._id;

    // Tìm và xóa đơn đăng ký
    const result = await Registration.findOneAndDelete({
      event: eventId,
      volunteer: volunteerId,
      status: "pending", // Chỉ cho phép hủy khi trạng thái là 'pending'
    });

    if (!result) {
      return res.status(404).json({
        message:
          "Không tìm thấy đơn đăng ký hoặc đơn đã được xử lý (không thể hủy).",
      });
    }
    res.status(200).json({ message: "Hủy đăng ký thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Volunteer xem lịch sử đăng ký của mình
 * @route GET /api/registrations/history/my
 * @access Private (Volunteer)
 */
export const getMyHistory = async (req, res) => {
  try {
    // Tìm tất cả đăng ký của user, populate thông tin sự kiện và sắp xếp
    const history = await Registration.find({ volunteer: req.user._id })
      .populate("event", "name date status")
      .sort({ createdAt: -1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Volunteer gửi yêu cầu hủy đăng ký (khi đã được duyệt)
 * @route PUT /api/registrations/:registrationId/cancel-request
 * @access Private (Volunteer)
 */
export const requestCancelRegistration = async (req, res) => {
  try {
    const registration = await Registration.findById(
      req.params.registrationId
    ).populate("event");
    if (!registration) {
      return res.status(404).json({ message: "Không tìm thấy đăng ký." });
    }

    // Kiểm tra xem có phải là chủ nhân của đơn đăng ký không
    if (String(registration.volunteer) !== String(req.user._id)) {
      return res.status(403).json({ message: "Không có quyền thực hiện." });
    }

    // Kiểm tra điều kiện: sự kiện phải sắp diễn ra và đơn đã được duyệt
    const eventDate = new Date(registration.event.date);
    if (registration.status !== "approved" || eventDate <= new Date()) {
      return res.status(400).json({
        message:
          "Chỉ có thể yêu cầu hủy khi sự kiện sắp diễn ra và đã được duyệt.",
      });
    }

    // Đặt cờ yêu cầu hủy
    registration.cancelRequest = true;
    await registration.save();

    res.status(200).json({ message: "Đã gửi yêu cầu hủy đăng ký thành công." });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

// =================================================================================================
// Chức năng cho Event Manager
// =================================================================================================

/**
 * @desc Manager xem danh sách người đăng ký một sự kiện
 * @route GET /api/registrations/:eventId/participants
 * @access Private (Manager)
 */
export const getEventRegistrations = async (req, res) => {
  try {
    // Lấy danh sách đăng ký của một sự kiện, populate thông tin volunteer
    const registrations = await Registration.find({
      event: req.params.eventId,
    }).populate("volunteer", "name email");
    res.status(200).json(registrations);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Manager duyệt hoặc từ chối đơn đăng ký
 * @route PUT /api/registrations/:registrationId/status
 * @access Private (Manager)
 */
export const updateRegistrationStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'approved' hoặc 'rejected'
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    // Tìm và cập nhật trạng thái
    const updatedReg = await Registration.findByIdAndUpdate(
      req.params.registrationId,
      { status },
      { new: true }
    );
    res.status(200).json({
      message: "Cập nhật trạng thái thành công",
      registration: updatedReg,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

/**
 * @desc Manager đánh dấu một đăng ký là đã hoàn thành
 * @route PUT /api/registrations/:registrationId/complete
 * @access Private (Manager)
 */
export const markAsCompleted = async (req, res) => {
  try {
    // Tìm và cập nhật trạng thái thành 'completed'
    const updatedReg = await Registration.findByIdAndUpdate(
      req.params.registrationId,
      { status: "completed" },
      { new: true }
    );
    res.status(200).json({
      message: "Đánh dấu hoàn thành thành công",
      registration: updatedReg,
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};
