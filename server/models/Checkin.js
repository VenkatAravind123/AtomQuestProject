import mongoose from "mongoose"
const PHASES = ["Q1", "Q2", "Q3", "Q4"];

const checkinSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    managerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    phase: { type: String, enum: PHASES, required: true, index: true },

    comment: { type: String, required: true, trim: true, maxlength: 4000 },
  },
  { timestamps: true }
);

checkinSchema.index({ employeeId: 1, phase: 1 }, { unique: true });

export default mongoose.model("Checkin", checkinSchema);