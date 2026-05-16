const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Routes (create these files under server/routes/)
const authRoutes = require("./routes/authRoutes.js");
const employeeRoutes = require("./routes/employeeRoutes.js");
const managerRoutes = require("./routes/managerRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");
const reportsRoutes = require("./routes/reportsRoutes.js");

const app = express();

// to parse JSON data
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5174",
    credentials: true,
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

// 404 fallback
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Basic error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    details: err.details || undefined,
  });
});

const port = process.env.PORT || 5000;

const dburl = process.env.MONGO_DB_URL || process.env.MONGODB_URI;
if (!dburl) {
  console.error("Missing MONGO_DB_URL (or MONGODB_URI) in .env");
  process.exit(1);
}

mongoose
  .connect(dburl)
  .then(() => {
    console.log("Connected to DB Successfully");
    app.listen(port, () => {
      console.log(`Server is running at port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err.message);
    process.exit(1);
  });