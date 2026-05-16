const express = require("express");
const router = express.Router();

const requireAuth = require("../middleware/auth");
const authController = require("../controller/authController");

router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);
router.post("/logout", authController.logout);

module.exports = router;