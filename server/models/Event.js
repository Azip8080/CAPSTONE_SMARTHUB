
const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    barangay: {
      type: String,
      trim: true,
      default: "All Barangays",
      index: true,
    },
    barangays: {
      type: [String],
      default: [],
      set: (values) =>
        Array.isArray(values)
          ? [...new Set(values.map((value) => String(value).trim()).filter(Boolean))]
          : [],
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      default: "",
      trim: true,
    },
    endTime: {
      type: String,
      default: "",
      trim: true,
    },
    sdgTag: {
      type: String,
      required: true,
      enum: Array.from(
        { length: 17 },
        (_, index) => `SDG ${index + 1}`
      ),
    },
    document: {
      path: {
        type: String,
        default: "",
      },
      originalName: {
        type: String,
        default: "",
      },
      mimeType: {
        type: String,
        default: "",
      },
    },
    reviewStatus: {
      type: String,
      enum: ["Pending Review", "Approved", "Rejected"],
      default: "Approved",
      index: true,
    },
    reviewRemarks: {
      type: String,
      default: "",
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    publicationStatus: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Published",
      index: true,
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ barangay: 1, date: 1 });
EventSchema.index({ barangays: 1, date: 1 });
EventSchema.index({
  publicationStatus: 1,
  reviewStatus: 1,
  date: 1,
});

module.exports = mongoose.model("Event", EventSchema);
