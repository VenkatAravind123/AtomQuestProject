const mongoose = require("mongoose");

const PHASES = ["GOAL_SETTING", "Q1", "Q2", "Q3", "Q4"];

const cycleSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true, index: true },
    phase: { type: String, enum: PHASES, required: true, index: true },
    windowStart: { type: Date, required: true },
    windowEnd: { type: Date, required: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

cycleSchema.index({ year: 1, phase: 1 }, { unique: true });

module.exports = mongoose.model("Cycle", cycleSchema);