import express from "express";
import { verifyToken, eventManager } from "../middlewares/auth.js";
import {
  registerForEvent,
  cancelRegistration,
  getMyHistory,
  getEventRegistrations,
  updateRegistrationStatus,
  markAsCompleted,
} from "../controllers/registration.controller.js";

const router = express.Router();

// --- Các API cho Volunteer (Chỉ cần đăng nhập) ---
router.post("/:eventId", verifyToken, registerForEvent);
router.delete("/:eventId", verifyToken, cancelRegistration);
router.get("/history/my", verifyToken, getMyHistory); // Đổi tên để tránh xung đột

// --- Các API cho Event Manager (Cần quyền Manager) ---
router.get(
  "/:eventId/participants",
  verifyToken,
  eventManager,
  getEventRegistrations
);
router.put(
  "/:registrationId/status",
  verifyToken,
  eventManager,
  updateRegistrationStatus
);
router.put(
  "/:registrationId/complete",
  verifyToken,
  eventManager,
  markAsCompleted
);

export default router;
