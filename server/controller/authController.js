// controller/authController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET");
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);

  // cookie for browser
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // set true only on https
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.json({
    token, // also return for Postman usage
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
};

exports.me = async (req, res) => {
  return res.json({ user: req.user });
};

exports.logout = async (req, res) => {
  res.clearCookie("token");
  return res.json({ ok: true });
};