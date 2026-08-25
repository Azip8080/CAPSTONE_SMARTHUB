const express = require("express");
const router = express.Router();
const KnowledgeArticle = require("../models/KnowledgeArticle");
console.log("DEBUG KnowledgeArticle:", typeof KnowledgeArticle, KnowledgeArticle);
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/", async (req, res) => {
  try {
    const articles = await KnowledgeArticle.find().sort({ createdAt: -1 });
    res.json({ success: true, data: articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const article = await KnowledgeArticle.create({ ...req.body, createdBy: req.user.id });
    res.status(201).json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const article = await KnowledgeArticle.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    res.json({ success: true, data: article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const article = await KnowledgeArticle.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: "Article not found" });
    res.json({ success: true, message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;