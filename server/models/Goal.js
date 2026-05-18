import mongoose from "mongoose"

const UOM_TYPES = ["MIN", "MAX", "TIMELINE", "ZERO"];
const SHARED_ROLE = ["PRIMARY", "RECIPIENT"];

const goalSchema = new mongoose.Schema(
  {
    goalSheetId: { type: mongoose.Schema.Types.ObjectId, ref: "GoalSheet", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    thrustArea: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },

    uomType: { type: String, enum: UOM_TYPES, required: true, index: true },

    targetValue: { type: Number, default: null },
    targetDate: { type: Date, default: null },
actualAchievement: { type: Number, default: null }, // Actual value achieved by employee
achievementDate: { type: Date, default: null }, // When achievement was recorded
achievementStatus: { type: String, enum: ["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "EXCEEDED"], default: "NOT_STARTED" },
    weightage: { type: Number, required: true, min: 0, max: 100 },

    // Shared goal tracking
    sharedGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "SharedGoalGroup", default: null, index: true },
    sharedRole: { type: String, enum: SHARED_ROLE, default: null },
    baseWeightage: { type: Number, default: null }, // Original weightage from shared goal group
    adjustedWeightage: { type: Number, default: null }, // Employee's adjusted weightage (only for recipients)
    syncedAchievement: { type: Number, default: null }, // Achievement synced from primary owner
    isSyncedFromPrimary: { type: Boolean, default: false }, // Flag to track synced values
  },
  { timestamps: true }
);

// Simple validation - TIMELINE requires targetDate
goalSchema.pre("validate", function () {
  const isTimeline = this.uomType === "TIMELINE";
  const isZero = this.uomType === "ZERO";

  // ZERO type doesn't need target values
  if (isZero) {
    this.targetValue = null;
    this.targetDate = null;
  }

  // TIMELINE requires targetDate
  if (isTimeline && !this.targetDate) {
    throw new Error("targetDate is required for TIMELINE goals");
  }
});

export default mongoose.model("Goal", goalSchema);