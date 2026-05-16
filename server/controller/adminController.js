const bcrypt = require("bcryptjs");
const { z } = require("zod");
const User = require("../models/User");

const roles = ["EMPLOYEE", "MANAGER", "ADMIN"];

const bootstrapSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  department: z.string().optional().nullable(),
});

const createUserSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(roles),
  managerId: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
});

exports.bootstrapAdmin = async (req, res) => {
  // Allow only if no ADMIN exists yet
  const adminCount = await User.countDocuments({ role: "ADMIN" });
  if (adminCount > 0) {
    return res.status(403).json({ message: "Admin already exists. Bootstrap disabled." });
  }

  const parsed = bootstrapSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", details: parsed.error.flatten() });
  }

  const { name, email, password, department } = parsed.data;

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

exports.createUser = async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid input", details: parsed.error.flatten() });
  }

  const { name, email, password, role, managerId, department } = parsed.data;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ message: "Email already exists" });

  // Optional: enforce that EMPLOYEE must have managerId
  // if (role === "EMPLOYEE" && !managerId) {
  //   return res.status(400).json({ message: "managerId is required for EMPLOYEE" });
  // }

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