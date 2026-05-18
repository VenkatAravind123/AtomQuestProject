import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import * as reportsController from "../controller/reportsController.js";
import AuditLog from "../models/AuditLog.js";
const router = express.Router();

router.use(requireAuth);

// Admin dashboard
router.get("/admin/dashboard", requireRole("ADMIN"), reportsController.getAdminDashboard);

// Manager dashboard
router.get("/manager/dashboard", requireRole("MANAGER"), reportsController.getManagerDashboard);

// Employee dashboard
router.get("/employee/dashboard", requireRole("EMPLOYEE"), reportsController.getEmployeeDashboard);

// CSV exports
router.get("/admin/export-goals", requireRole("ADMIN"), reportsController.exportGoalsCSV);
router.get("/manager/export-checkins", requireRole("MANAGER"), reportsController.exportCheckinsCSV);
router.put("/goals/:goalId/achievement", requireAuth, reportsController.updateGoalAchievement);
router.get("/audit-logs", requireAuth, requireRole("ADMIN"), async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(500)
      .populate("actorUserId", "name email");
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
export default router;