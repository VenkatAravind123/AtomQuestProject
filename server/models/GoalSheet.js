const mongoose = require("mongoose");

const GOAL_SHEET_STATUS = ["DRAFT", "SUBMITTED", "RETURNED", "LOCKED"];

const goalSheetSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    year: { type: Number, required: true, index: true },

    status: { type: String, enum: GOAL_SHEET_STATUS, default: "DRAFT", index: true },

    submittedAt: { type: Date, default: null },
    approvedAt: { type: Date, default: null },
    lockedAt: { type: Date, default: null },

    returnedReason: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

goalSheetSchema.index({ employeeId: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("GoalSheet", goalSheetSchema);