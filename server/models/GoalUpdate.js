import mongoose from "mongoose";

const goalUpdateSchema = new mongoose.Schema(
  {
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    
    quarter: { type: String, enum: ["Q1", "Q2", "Q3", "Q4"], required: true },
    year: { type: Number, required: true },
    
    progressPercentage: { type: Number, required: true, min: 0, max: 100 },
    comments: { type: String, default: "", trim: true, maxlength: 1000 },
    status: { type: String, enum: ["ON_TRACK", "AT_RISK", "DELAYED", "COMPLETED"], required: true },
    
    submittedAt: { type: Date, default: null },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

goalUpdateSchema.index({ goalId: 1, quarter: 1, year: 1 }, { unique: true });

export default mongoose.model("GoalUpdate", goalUpdateSchema);