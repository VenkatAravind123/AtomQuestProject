import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

function signToken(user) {
  if (!process.env.JWT_SECRET) throw new Error("Missing JWT_SECRET");
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

 const isProd = process.env.NODE_ENV === "production"; 
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: String(email).toLowerCase().trim() });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signToken(user);
  res.cookie("token", token, {
    httpOnly: true,
    secure: isProd,  // only send cookie over HTTPS in production
    sameSite: isProd ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({ token, user });
};
// export const login = async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email: String(email).toLowerCase().trim() });
//   if (!user) return res.status(401).json({ message: "Invalid credentials" });

//   const ok = await bcrypt.compare(String(password), user.passwordHash);
//   if (!ok) return res.status(401).json({ message: "Invalid credentials" });

//   const token = signToken(user);
//   res.cookie("token", token, {
//     httpOnly: true,
//     secure: secure,
//     sameSite: "none",
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });

//   res.json({ token, user });
// };

export const me = async (req, res) => {
  res.json({ user: req.user });
};

export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out" });
};