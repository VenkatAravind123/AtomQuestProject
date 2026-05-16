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

    weightage: { type: Number, required: true, min: 0, max: 100 },

    sharedGroupId: { type: mongoose.Schema.Types.ObjectId, ref: "SharedGoalGroup", default: null, index: true },
    sharedRole: { type: String, enum: SHARED_ROLE, default: null },
  },
  { timestamps: true }
);

goalSchema.pre("validate", function (next) {
  const isTimeline = this.uomType === "TIMELINE";
  const isZero = this.uomType === "ZERO";
  const isMinMax = this.uomType === "MIN" || this.uomType === "MAX";

  if (isTimeline) {
    if (!this.targetDate) return next(new Error("targetDate is required for TIMELINE goals"));
  }

  if (isMinMax) {
    if (typeof this.targetValue !== "number") return next(new Error("targetValue is required for MIN/MAX goals"));
    if (this.targetValue <= 0) return next(new Error("targetValue must be > 0 for MIN/MAX goals"));
  }

  if (isZero) {
    this.targetValue = null;
    this.targetDate = null;
  }

  if (this.sharedGroupId && !this.sharedRole) {
    return next(new Error("sharedRole is required when sharedGroupId is set"));
  }

  next();
});

export default mongoose.model("Goal", goalSchema);