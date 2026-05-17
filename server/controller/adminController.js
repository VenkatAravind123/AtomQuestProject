import bcrypt from "bcryptjs";
import User from "../models/User.js";

const roles = ["EMPLOYEE", "MANAGER", "ADMIN"];




export const bootstrapAdmin = async (req, res) => {
  // Allow only if no ADMIN exists yet
  const adminCount = await User.countDocuments({ role: "ADMIN" });
  if (adminCount > 0) {
    return res.status(403).json({ message: "Admin already exists. Bootstrap disabled." });
  }

const { name, email, password, department } = req.body;

// Basic checks
if (!name || !email || !password) {
  return res.status(400).json({ message: "name, email, password required" });
}

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role: "ADMIN",
    managerId: null,
    department: department ?? null,
  });

  return res.status(201).json({
    message: "Admin bootstrapped",
    user: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
};

export const createUser = async (req, res) => {
  const { name, email, password, role, managerId, department } = req.body;

// Basic checks
if (!name || !email || !password || !role) {
  return res.status(400).json({ message: "name, email, password, role required" });
}

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,
    managerId: managerId || null,
    department: department ?? null,
  });

  return res.status(201).json({
    message: "User created",
    user: { id: user._id, name: user.name, email: user.email, role: user.role, managerId: user.managerId },
  });
};

export const getManagers = async (req, res) => {
  try {
    const managers = await User.find({ role: "MANAGER" }).select("_id name email");
    res.json(managers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};