const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema(
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
    sdgTag: {
      type: String,
      required: true,
      trim: true,
    },
    sdgTags: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    barangay: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return !this.startDate || value >= this.startDate;
        },
        message: "End date must be on or after the start date.",
      },
    },
    status: {
      type: String,
      enum: ["Planned", "Ongoing", "Completed"],
      default: "Planned",
    },
    photos: {
      type: [String],
      default: [],
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
    featured: {
      type: Boolean,
      default: false,
    },
    reviewStatus: {
      type: String,
      enum: ["Pending Review", "Approved", "Rejected"],
      default: "Pending Review",
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
      default: "Draft",
      index: true,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

ProjectSchema.index({
  publicationStatus: 1,
  reviewStatus: 1,
  createdAt: -1,
});

module.exports = mongoose.model("Project", ProjectSchema);