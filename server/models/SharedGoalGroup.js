import mongoose from "mongoose";

const sharedGoalGroupSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    applicableRole: { type: String, enum: ["EMPLOYEE", "MANAGER", "ADMIN"], required: true },
    
    goals: [
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    thrustArea: { type: String, required: true },
    uomType: { type: String, enum: ["MIN", "MAX", "TIMELINE", "ZERO"], default: "MAX" },
    targetValue: { type: Number, default: 0 },
    targetDate: { type: Date, default: null },
    weightage: { type: Number, required: true },
    achievement: { type: Number, default: null }, // PRIMARY owner's achievement
    achievementDate: { type: Date, default: null },
  },
],
    
    primaryOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("SharedGoalGroup", sharedGoalGroupSchema);