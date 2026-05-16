const mongoose = require("mongoose");

const ENTITY_TYPES = ["GOAL", "GOAL_SHEET", "CYCLE", "SHARED_GOAL", "GOAL_UPDATE", "CHECKIN"];

const auditLogSchema = new mongoose.Schema(
  {
    entityType: { type: String, enum: ENTITY_TYPES, required: true, index: true },
    entityId: { type: String, required: true, index: true },

    action: { type: String, required: true, trim: true },

    before: { type: mongoose.Schema.Types.Mixed, default: null },
    after: { type: mongoose.Schema.Types.Mixed, default: null },

    actorUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    timestamp: { type: Date, default: () => new Date(), index: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);