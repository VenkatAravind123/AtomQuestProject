import express from "express";
const router = express.Router();

router.get("/ping", (req, res) => {
  res.json({ ok: true, route: "manager" });
});

export default router;