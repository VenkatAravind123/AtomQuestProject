import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import * as adminController from "../controller/adminController.js";
import * as sharedGoalsController from "../controller/sharedGoalsController.js";

const router = express.Router();

// For first-time setup only (no auth; works only if no admin exists)
router.post("/bootstrap", adminController.bootstrapAdmin);

// Admin-only endpoints
router.post("/users", requireAuth, requireRole("ADMIN"), adminController.createUser);

router.get("/ping", requireAuth, requireRole("ADMIN"), (req, res) => {
  res.json({ ok: true, route: "admin", user: req.user });
});
router.get("/users", requireAuth, requireRole("ADMIN"), adminController.getUsers);
router.get("/managers", requireAuth, requireRole("ADMIN"), adminController.getManagers);

router.get("/shared-goals", requireAuth, requireRole("ADMIN"), sharedGoalsController.getSharedGoalGroups);
router.post("/shared-goals", requireAuth, requireRole("ADMIN"), sharedGoalsController.createSharedGoalGroup);
router.put("/shared-goals/:groupId", requireAuth, requireRole("ADMIN"), sharedGoalsController.updateSharedGoalGroup);
router.delete("/shared-goals/:groupId", requireAuth, requireRole("ADMIN"), sharedGoalsController.deleteSharedGoalGroup);
router.post("/shared-goals/assign", requireAuth, requireRole("ADMIN"), sharedGoalsController.assignSharedGoals);
router.post("/shared-goals/bulk-assign", requireAuth, requireRole("ADMIN"), sharedGoalsController.bulkAssignSharedGoals);
router.get("/users-by-role", requireAuth, requireRole("ADMIN"), sharedGoalsController.getUsersByRole);

router.put("/shared-goals/achievement", requireAuth, requireRole("ADMIN"), sharedGoalsController.updateSharedGoalAchievement);

router.delete('/users/:userId', requireAuth, requireRole("ADMIN"), adminController.deleteUser);
//router.put("/goals/:goalId/adjust-weightage", requireAuth, requireRole("EMPLOYEE"), sharedGoalsController.adjustSharedGoalWeightage);
export default router;