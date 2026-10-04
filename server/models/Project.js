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

    status: {
      type: String,
      enum: [
        "Planned",
        "Ongoing",
        "Completed",
      ],
      default: "Planned",
    },

    photos: {
      type: [String],
      default: [],
    },

    featured: {
      type: Boolean,
      default: false,
    },

    publicationStatus: {
      type: String,
      enum: [
        "Draft",
        "Published",
      ],
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
  {
    timestamps: true,
  }
);

ProjectSchema.index({
  publicationStatus: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "Project",
  ProjectSchema
);