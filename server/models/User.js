const mongoose = require("mongoose");

const USER_ROLES = ["EMPLOYEE", "MANAGER", "ADMIN"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2 },
    email: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
    passwordHash: { type: String, required: true },

    role: { type: String, enum: USER_ROLES, required: true, index: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },

    department: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);