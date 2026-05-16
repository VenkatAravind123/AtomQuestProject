import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { requireRole } from "../middleware/requireRole.js";
import * as adminController from "../controller/adminController.js";

const router = express.Router();

// For first-time setup only (no auth; works only if no admin exists)
router.post("/bootstrap", adminController.bootstrapAdmin);

// Admin-only endpoints
router.post("/users", requireAuth, requireRole("ADMIN"), adminController.createUser);

router.get("/ping", requireAuth, requireRole("ADMIN"), (req, res) => {
  res.json({ ok: true, route: "admin", user: req.user });
});

export default router;