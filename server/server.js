import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import cyclesRoutes from "./routes/cyclesRoutes.js";

dotenv.config();

const app = express();

// to parse JSON data
// server/server.js
const allowedOrigin =
  process.env.ORIGIN ||
  (process.env.NODE_ENV === "production"
    ? "https://atom-quest-project.vercel.app"   // <-- replace with your real Vercel URL
    : "http://localhost:5173");

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,   // needed for httpOnly cookie
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.json({
    ok: true,
    service: "atomquest-api",
    time: new Date().toISOString(),
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/employee", employeeRoutes);
app.use("/api/manager", managerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/admin/cycles", cyclesRoutes);

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Basic error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
  });
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_DB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});