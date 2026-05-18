import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  getGoalSheet,
  createGoal,
  updateGoal,
  deleteGoal,
  submitGoalSheet,
  getManager,
  submitGoalUpdate,
  getGoalUpdates,
  getQuarterlyUpdates,
  getEmployeeGoals,
} from "../controller/employeeController.js";
import * as sharedGoalsController from "../controller/sharedGoalsController.js";

const router = express.Router();
router.use(requireAuth);
router.use(requireRole("EMPLOYEE"));

router.get("/goals/sheet", getGoalSheet);
router.post("/goals", createGoal);
router.put("/goals/:goalId", updateGoal);
router.delete("/goals/:goalId", deleteGoal);
router.post("/goals/submit", submitGoalSheet);
router.get("/manager", getManager);
router.post("/goals/:goalId/update", submitGoalUpdate);
router.get("/goals/:goalId/updates", getGoalUpdates);
router.get("/updates/quarterly", getQuarterlyUpdates);
router.put("/goals/:goalId/adjust-weightage", requireAuth, requireRole("EMPLOYEE"), sharedGoalsController.adjustSharedGoalWeightage);
router.get("/goals", requireAuth ,getEmployeeGoals);

export default router;