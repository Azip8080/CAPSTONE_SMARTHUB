
const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    userRole: {
      type: String,
      default: "unknown",
      trim: true,
    },
    barangay: {
      type: String,
      default: "",
      trim: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "LOGIN",
        "LOGOUT",
        "PROJECT_SUBMITTED",
        "EVENT_SUBMITTED",
        "PROJECT_APPROVED",
        "PROJECT_REJECTED",
        "EVENT_APPROVED",
        "EVENT_REJECTED",
        "PROJECT_UPDATED",
        "EVENT_UPDATED",
        "PROJECT_DELETED",
        "EVENT_DELETED",
        "USER_CREATED",
        "USER_ACTIVATED",
        "USER_REJECTED",
        "USER_UPDATED",
        "USER_DELETED",
      ],
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    targetType: {
      type: String,
      enum: ["Project", "Event", "User", "Other"],
      default: "Other",
    },
    remarks: {
      type: String,
      default: "",
      trim: true,
    },
    ipAddress: {
      type: String,
      default: "",
    },
    userAgent: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
