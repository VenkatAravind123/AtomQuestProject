// middleware/requireAuth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization;
    const bearerToken =
      header && header.startsWith("Bearer ") ? header.slice(7) : null;

    const cookieToken = req.cookies?.token;
    const token = bearerToken || cookieToken;

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id).select("-passwordHash");

    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid/expired token" });
  }
};