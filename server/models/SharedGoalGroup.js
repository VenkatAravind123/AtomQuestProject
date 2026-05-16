import mongoose from "mongoose";

const sharedGoalGroupSchema = new mongoose.Schema(
  {
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    primaryOwnerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

    title: { type: String, default: null, trim: true },
    thrustArea: { type: String, default: null, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("SharedGoalGroup", sharedGoalGroupSchema);