import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getPendingApprovals,
  approveGoalSheet,
  rejectGoalSheet,
  createCheckin,
  getTeamCheckins,
  getGoalCheckins,
} from "../controller/managerController.js";

const router = express.Router();
router.use(requireAuth);
router.use(requireRole("MANAGER"));

// Approvals
router.get("/pending-approvals", getPendingApprovals);
router.post("/approve/:sheetId", approveGoalSheet);
router.post("/reject/:sheetId", rejectGoalSheet);

// Check-ins
router.post("/checkins", createCheckin);
router.get("/checkins", getTeamCheckins);
router.get("/goals/:goalId/checkins", getGoalCheckins);

export default router;