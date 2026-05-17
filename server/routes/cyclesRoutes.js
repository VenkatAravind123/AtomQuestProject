import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import * as cyclesController from "../controller/cyclesController.js";

const router = express.Router();

// All routes require ADMIN role
router.use(requireAuth, requireRole("ADMIN"));

// CRUD operations
router.get("/", cyclesController.getCycles);
router.get("/year/:year", cyclesController.getCyclesByYear);
router.post("/", cyclesController.createCycle);
router.post("/:cycleId/activate", cyclesController.activateCycle);
router.post("/:cycleId/close", cyclesController.closeCycle);
router.delete("/:cycleId", cyclesController.deleteCycle);

// Get current active cycle (public for all users)
router.get("/active", async (req, res) => {
  try {
    const cycle = await require("../models/Cycle.js").default.findOne({ active: true }).sort({ createdAt: -1 });
    res.json(cycle || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;