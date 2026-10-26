
const mongoose = require("mongoose");

const UploadedDocumentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    storedName: {
      type: String,
      required: true,
    },
    gridFsId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      unique: true,
      index: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    source: {
      type: String,
      enum: ["AI Classifier"],
      default: "AI Classifier",
    },
    destination: {
      type: String,
      enum: ["Projects", "Events", "Knowledge Hub", null],
      default: null,
    },
    destinationId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

UploadedDocumentSchema.index({ createdAt: -1 });

module.exports = mongoose.model(
  "UploadedDocument",
  UploadedDocumentSchema
);
