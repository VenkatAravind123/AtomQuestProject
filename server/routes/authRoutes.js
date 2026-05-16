import express from "express";
import { requireAuth } from "../middleware/auth.js";
import * as authController from "../controller/authController.js";

const router = express.Router();

router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);
router.post("/logout", authController.logout);

export default router;