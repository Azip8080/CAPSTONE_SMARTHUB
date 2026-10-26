const mongoose = require("mongoose");

const CompletionReportSchema = new mongoose.Schema(
  {
    filterKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    filters: {
      from: { type: String, default: "" },
      to: { type: String, default: "" },
      sdg: { type: String, default: "" },
      barangay: { type: String, default: "" },
      modules: { type: [String], default: [] },
    },
    recommendations: {
      type: String,
      default: "",
      maxlength: 20000,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CompletionReport", CompletionReportSchema);