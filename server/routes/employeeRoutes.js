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
} from "../controller/employeeController.js";

const router = express.Router();
router.use(requireAuth);
router.use(requireRole("EMPLOYEE"));

router.get("/goals/sheet", getGoalSheet);
router.post("/goals", createGoal);
router.put("/goals/:goalId", updateGoal);
router.delete("/goals/:goalId", deleteGoal);
router.post("/goals/submit", submitGoalSheet);
router.get("/manager", getManager);

export default router;