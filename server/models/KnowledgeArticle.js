const mongoose = require("mongoose");

const KnowledgeArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  summary: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  },

  sdgTag: {
    type: String,
    required: true
  },

  category: {
    type: String,
    default: "Guide"
  },

  photos: {
    type: [String],
    default: []
  },

  readTime: {
    type: String,
    default: "5 min read"
  },

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }

}, { timestamps: true });

module.exports = mongoose.model(
  "KnowledgeArticle",
  KnowledgeArticleSchema
);