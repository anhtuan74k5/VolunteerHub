// src/utils/cronJob.js
import cron from "node-cron";
import Event from "../models/event.js";
import { processEventCompletion } from "../controllers/event.controller.js";

export const startCronJobs = () => {
  // Cấu hình: Chạy mỗi phút một lần (*/1 * * * *)
  // Nếu muốn 5 phút chạy 1 lần thì sửa thành "*/5 * * * *"
  cron.schedule("*/720 * * * *", async () => {
    console.log("🚀 Cron Job khởi động...");
    try {
      console.log("⏳ Cron Job đang quét các sự kiện hết hạn...");
      const now = new Date();

      // Tìm các sự kiện thỏa mãn 3 điều kiện:
      // 1. Trạng thái đang là 'approved' (đã duyệt)
      // 2. Thời gian kết thúc (endDate) nhỏ hơn hoặc bằng hiện tại (đã quá hạn)
      // 3. Chưa bị chuyển thành completed
      const expiredEvents = await Event.find({
        status: "approved",
        endDate: { $lte: now },
      });

      if (expiredEvents.length > 0) {
        console.log(
          ` Tìm thấy ${expiredEvents.length} sự kiện quá hạn. Đang xử lý...`
        );

        // Duyệt qua từng sự kiện và xử lý
        for (const event of expiredEvents) {
          await processEventCompletion(event);
        }
      } else {
        console.log("✅ Không có sự kiện nào cần xử lý.");
      }
    } catch (error) {
      console.error(" Lỗi trong Cron Job:", error.message);
    }
  });
};
