// src/controllers/statistics.controller.js
import Event from "../models/event.js";
import Registration from "../models/registration.js";
import User from "../models/user.js";
/**
 * @desc Lấy thống kê tổng quan cho một volunteer
 * @route GET /api/statistics/volunteer/overview
 * @access Private (Volunteer)
 */
export const getVolunteerStatistics = async (req, res) => {
  try {
    const volunteerId = req.user._id;

    // Đếm tổng số lần đăng ký
    const totalRegistrations = await Registration.countDocuments({
      volunteer: volunteerId,
    });
    // Đếm số sự kiện đã hoàn thành
    const totalCompleted = await Registration.countDocuments({
      volunteer: volunteerId,
      status: "completed",
    });
    // Đếm số sự kiện đã được duyệt
    const totalApproved = await Registration.countDocuments({
      volunteer: volunteerId,
      status: "approved",
    });
    // Đếm số sự kiện đang chờ duyệt
    const totalPending = await Registration.countDocuments({
      volunteer: volunteerId,
      status: "pending",
    });
    // Đếm số yêu cầu hủy đang chờ xử lý
    const totalCancelRequests = await Registration.countDocuments({
      volunteer: volunteerId,
      cancelRequest: true,
    });

    // Tính tỷ lệ hoàn thành
    const completionRate = totalRegistrations
      ? ((totalCompleted / totalRegistrations) * 100).toFixed(2)
      : 0;
    // Tính tỷ lệ được duyệt
    const approvalRate = totalRegistrations
      ? ((totalApproved / totalRegistrations) * 100).toFixed(2)
      : 0;

    // Trả về dữ liệu thống kê
    res.json({
      totalRegistrations,
      totalCompleted,
      totalApproved,
      totalPending,
      totalCancelRequests,
      completionRate,
      approvalRate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy thống kê", error: error.message });
  }
};

/**
 * @desc Thống kê chi tiết hoạt động volunteer theo tháng
 * @route GET /api/statistics/volunteer/monthly?year=YYYY
 * @access Private (Volunteer)
 */
export const getVolunteerStatisticsByMonth = async (req, res) => {
  try {
    const volunteerId = req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Lấy toàn bộ đăng ký của volunteer trong năm được chọn
    const regs = await Registration.find({
      volunteer: volunteerId,
      createdAt: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    });

    // Khởi tạo mảng dữ liệu cho 12 tháng
    const stats = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      total: 0,
      completed: 0,
      approved: 0,
      pending: 0,
    }));

    // Lặp qua các đơn đăng ký và cập nhật thống kê cho tháng tương ứng
    regs.forEach((r) => {
      const month = new Date(r.createdAt).getMonth(); // getMonth() trả về 0-11
      stats[month].total++;
      if (r.status === "completed") stats[month].completed++;
      if (r.status === "approved") stats[month].approved++;
      if (r.status === "pending") stats[month].pending++;
    });

    res.json({ year, monthlyStats: stats });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thống kê theo tháng",
      error: error.message,
    });
  }
};

/**
 * @desc Thống kê tổng quan cho Event Manager
 * @route GET /api/statistics/manager/overview
 * @access Private (Manager)
 */
export const getManagerStatistics = async (req, res) => {
  try {
    const managerId = req.user._id;

    // Lấy tất cả sự kiện do manager tạo
    const myEvents = await Event.find({ createdBy: managerId }).select(
      "_id status"
    );
    const eventIds = myEvents.map((e) => e._id);

    // Đếm số lượng sự kiện theo từng trạng thái
    const totalEvents = myEvents.length;
    const pendingEvents = myEvents.filter((e) => e.status === "pending").length;
    const approvedEvents = myEvents.filter(
      (e) => e.status === "approved"
    ).length;
    const completedEvents = myEvents.filter(
      (e) => e.status === "completed"
    ).length;

    // Đếm tổng số lượt đăng ký và yêu cầu hủy trên tất cả sự kiện
    const [totalRegistrations, totalCancelRequests] = await Promise.all([
      Registration.countDocuments({ event: { $in: eventIds } }),
      Registration.countDocuments({
        event: { $in: eventIds },
        cancelRequest: true,
      }),
    ]);

    res.json({
      totalEvents,
      pendingEvents,
      approvedEvents,
      completedEvents,
      totalRegistrations,
      totalCancelRequests,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy thống kê manager", error: error.message });
  }
};

/**
 * @desc Thống kê lượt đăng ký theo tháng cho Event Manager
 * @route GET /api/statistics/manager/monthly?year=YYYY
 * @access Private (Manager)
 */
export const getManagerMonthlyStats = async (req, res) => {
  try {
    const managerId = req.user._id;
    const year = parseInt(req.query.year) || new Date().getFullYear();

    // Lấy ID của các sự kiện do manager tạo
    const myEvents = await Event.find({ createdBy: managerId }).select("_id");
    const eventIds = myEvents.map((e) => e._id);

    // Lấy tất cả các đơn đăng ký trong năm cho các sự kiện này
    const regs = await Registration.find({
      event: { $in: eventIds },
      createdAt: {
        $gte: new Date(`${year}-01-01T00:00:00.000Z`),
        $lte: new Date(`${year}-12-31T23:59:59.999Z`),
      },
    }).select("createdAt");

    // Khởi tạo mảng thống kê cho 12 tháng
    const monthly = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      registrations: 0,
    }));

    // Lặp qua các đơn đăng ký và đếm số lượng cho mỗi tháng
    regs.forEach((r) => {
      const m = new Date(r.createdAt).getMonth(); // 0..11
      monthly[m].registrations++;
    });

    res.json({ year, monthly });
  } catch (error) {
    res.status(500).json({
      message: "Lỗi khi lấy thống kê tháng cho manager",
      error: error.message,
    });
  }
};

/**
 * @desc 📅 Lấy toàn bộ sự kiện trong hệ thống (tất cả user đều có thể xem)
 * @route GET /api/statistics/events
 * @access Private (Tất cả vai trò)
 */
export const getAllEventsForAllUsers = async (req, res) => {
  try {
    // 📌 Lấy toàn bộ sự kiện từ database, sắp xếp theo thời gian
    const events = await Event.find({})
      .sort({ date: -1 }) // Sự kiện gần nhất lên đầu
      .populate("createdBy", "name email phone role ") // Gắn thông tin người tạo
      .lean();

    if (!events.length) {
      return res.status(200).json({
        message: "👀 Hiện tại chưa có sự kiện nào trong hệ thống.",
        events: [],
      });
    }

    // 📊 Lấy thống kê số lượt đăng ký & yêu cầu hủy cho từng sự kiện
    const eventIds = events.map((e) => e._id);
    const registrationStats = await Registration.aggregate([
      { $match: { event: { $in: eventIds } } },
      {
        $group: {
          _id: "$event",
          totalRegistrations: { $sum: 1 },
          cancelRequests: {
            $sum: { $cond: [{ $eq: ["$cancelRequest", true] }, 1, 0] },
          },
        },
      },
    ]);

    // Chuyển kết quả thành Map để tra cứu nhanh
    const statsMap = registrationStats.reduce((acc, s) => {
      acc[s._id.toString()] = s;
      return acc;
    }, {});

    // Gộp thống kê vào từng sự kiện
    const result = events.map((e) => ({
      ...e,
      totalRegistrations: statsMap[e._id]?.totalRegistrations || 0,
      cancelRequests: statsMap[e._id]?.cancelRequests || 0,
    }));

    res.status(200).json({
      total: result.length,
      events: result,
    });
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách sự kiện:", error);
    res.status(500).json({
      message: "Lỗi khi lấy danh sách sự kiện",
      error: error.message,
    });
  }
};

// [GET] /api/statistics/ranking -> Lấy Top 10 thành viên điểm cao nhất
export const getRanking = async (req, res) => {
  try {
    const leaderboard = await User.find({ role: "VOLUNTEER" })
      .sort({ points: -1 })
      .limit(10)
      .select("name avatar points email");

    res.status(200).json(leaderboard);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi lấy bảng xếp hạng", error: error.message });
  }
};
