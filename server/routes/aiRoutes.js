const express        = require("express");
const router         = express.Router();
const multer         = require("multer");
const pdfParse       = require("pdf-parse");
const { classifyText } = require("../ai/classifier");
const auth           = require("../middleware/auth");
const adminOnly      = require("../middleware/adminOnly");

const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["application/pdf", "text/plain"];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error("Only PDF and TXT files are supported"));
  },
});

// POST /api/ai/classify-text
// Body: { title, description }
router.post("/classify-text", auth, adminOnly, async (req, res) => {
  try {
    const { title = "", description = "" } = req.body;
    const text = `${title} ${description}`.trim();

    if (!text) {
      return res.status(400).json({ success: false, message: "Title or description is required" });
    }

    const result = await classifyText(text);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error("classify-text error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/ai/classify-file
// Multipart: file (PDF or TXT)
router.post("/classify-file", auth, adminOnly, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    let text = "";

    if (req.file.mimetype === "application/pdf") {
      const parsed = await pdfParse(req.file.buffer);
      text = parsed.text;
    } else {
      text = req.file.buffer.toString("utf-8");
    }

    if (!text.trim()) {
      return res.status(400).json({ success: false, message: "Could not extract text from file" });
    }

    const result = await classifyText(text.slice(0, 3000));
    res.json({
      success:  true,
      filename: req.file.originalname,
      data:     result,
    });
  } catch (err) {
    console.error("classify-file error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;