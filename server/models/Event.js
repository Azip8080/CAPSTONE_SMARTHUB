
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
    date: {
      type: Date,
      required: true,
    },
    sdgTag: {
      type: String,
      required: true,
      enum: Array.from({ length: 17 }, (_, index) => `SDG ${index + 1}`),
    },
    document: {
      path: { type: String, default: "" },
      originalName: { type: String, default: "" },
      mimeType: { type: String, default: "" },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Event", EventSchema);