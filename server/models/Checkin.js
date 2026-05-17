import mongoose from "mongoose";

const checkinSchema = new mongoose.Schema(
  {
    goalId: { type: mongoose.Schema.Types.ObjectId, ref: "Goal", required: true, index: true },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    
    quarter: { type: String, enum: ["Q1", "Q2", "Q3", "Q4"], required: true },
    year: { type: Number, required: true },
    
    managerNotes: { type: String, default: "", trim: true, maxlength: 1000 },
    feedback: { type: String, enum: ["EXCELLENT", "GOOD", "NEEDS_IMPROVEMENT", "OFF_TRACK"], required: true },
    actionItems: { type: String, default: "", trim: true, maxlength: 500 },
    
    checkinDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

checkinSchema.index({ goalId: 1, quarter: 1, year: 1 }, { unique: true });

export default mongoose.model("Checkin", checkinSchema);