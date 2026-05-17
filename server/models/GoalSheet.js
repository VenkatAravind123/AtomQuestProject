import mongoose from "mongoose"

const GOAL_SHEET_STATUS = ["DRAFT", "SUBMITTED", "APPROVED","REJECTED", "LOCKED"];

const goalSheetSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    year: { type: Number, required: true, index: true },

    status: { type: String, enum: GOAL_SHEET_STATUS, default: "DRAFT", index: true },

    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
approvedAt: { type: Date, default: null },
rejectionReason: { type: String, default: null },
submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

goalSheetSchema.index({ employeeId: 1, year: 1 }, { unique: true });

export default mongoose.model("GoalSheet", goalSheetSchema);