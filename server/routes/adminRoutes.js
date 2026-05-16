const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const adminController = require("../controller/adminController");

// For first-time setup only (no auth; works only if no admin exists)
router.post("/bootstrap", adminController.bootstrapAdmin);

// Admin-only endpoints
router.post("/users", requireAuth, requireRole("ADMIN"), adminController.createUser);

router.get("/ping", requireAuth, requireRole("ADMIN"), (req, res) => {
  res.json({ ok: true, route: "admin", user: req.user });
});

module.exports = router;