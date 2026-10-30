
const mongoose = require("mongoose");

const KnowledgeArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    summary: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    sdgTag: {
  type: String,
  default: "",
},
    sdgTags: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: "Guide",
    },
    resourceType: {
      type: String,
      enum: ["uploaded", "youtube", "shorts", "article"],
      default: "uploaded",
    },
    sourceUrl: {
      type: String,
      default: "",
      trim: true,
    },
    embedUrl: {
      type: String,
      default: "",
    },
    thumbnailUrl: {
      type: String,
      default: "",
    },
    photos: {
      type: [String],
      default: [],
    },
    document: {
      path: { type: String, default: "" },
      originalName: { type: String, default: "" },
      mimeType: { type: String, default: "" },
    },
    readTime: {
      type: String,
      default: "5 min read",
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

module.exports = mongoose.model(
  "KnowledgeArticle",
  KnowledgeArticleSchema
);
