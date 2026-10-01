
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");

const { findKeywordMatches } = require("../ai/keywordMatches");
const { classifyText } = require("../ai/classifier");

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_ANALYSIS_TEXT = 20000;

const startedAt = Date.now();

console.log("[AI] File received");

console.log(
  `[AI] Text extraction took ${Date.now() - startedAt} ms`
);

const classificationStartedAt = Date.now();

console.log(
  `[AI] Classification took ${
    Date.now() - classificationStartedAt
  } ms`
);

console.log(
  `[AI] Total processing time: ${Date.now() - startedAt} ms`
);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (req, file, callback) => {
    console.log("[AI DEBUG] Checking file:", file.originalname);
    console.log("[AI DEBUG] MIME type:", file.mimetype);

    const allowedTypes = [
      "application/pdf",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      return callback(null, true);
    }

    return callback(
      new Error("Only PDF and TXT files are supported.")
    );
  },
});

function logAuthPassed(req, res, next) {
  console.log("[AI DEBUG] Authentication passed");
  next();
}

function logAdminPassed(req, res, next) {
  console.log("[AI DEBUG] Admin authorization passed");
  next();
}

function handleFileUpload(req, res, next) {
  console.log("[AI DEBUG] Starting upload middleware");

  upload.single("file")(req, res, (error) => {
    if (error) {
      console.error("[AI DEBUG] Upload middleware error:", error);

      const status =
        error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

      return res.status(status).json({
        success: false,
        message:
          error.code === "LIMIT_FILE_SIZE"
            ? "File is too large. Maximum size is 10 MB."
            : error.message || "File upload failed.",
      });
    }

    console.log("[AI DEBUG] Upload middleware finished");
    console.log(
      "[AI DEBUG] Uploaded filename:",
      req.file?.originalname || "No file received"
    );

    next();
  });
}

async function extractPdfText(buffer) {
  console.log("[AI DEBUG] PDF extraction started");
  console.log("[AI DEBUG] PDF buffer size:", buffer.length);

  if (typeof pdfParse === "function") {
    const parsed = await pdfParse(buffer);

    console.log("[AI DEBUG] PDF extraction completed");

    return parsed.text || "";
  }

  if (typeof pdfParse.PDFParse === "function") {
    const parser = new pdfParse.PDFParse({
      data: buffer,
    });

    try {
      const parsed = await parser.getText();

      console.log("[AI DEBUG] PDF extraction completed");

      return parsed.text || "";
    } finally {
      await parser.destroy();
    }
  }

  throw new Error(
    "Unsupported pdf-parse API. Check your installed version."
  );
}


async function buildClassification(text) {
  const startedAt = Date.now();
  const fullText = String(text || "").trim();

  if (!fullText) {
    throw new Error("There is no text to classify.");
  }

  const textTruncated = fullText.length > MAX_ANALYSIS_TEXT;
  const extractedText = fullText.slice(0, MAX_ANALYSIS_TEXT);

  console.log(
    `[AI TIMING] Text preparation: ${Date.now() - startedAt} ms`
  );
  console.log(`[AI] Analyzing ${extractedText.length} characters`);

  const classificationStartedAt = Date.now();
  const result = await classifyText(extractedText);

  console.log(
    `[AI TIMING] Classification: ${
      Date.now() - classificationStartedAt
    } ms`
  );

  const matchesStartedAt = Date.now();
  const keywordMatches = findKeywordMatches(extractedText);

  console.log(
    `[AI TIMING] Evidence matching: ${
      Date.now() - matchesStartedAt
    } ms`
  );
  console.log(
    `[AI TIMING] Total classification pipeline: ${
      Date.now() - startedAt
    } ms`
  );

  return {
    ...result,
    extractedText,
    keywordMatches,
    textTruncated,
  };
}

router.post(
  "/classify-text",
  (req, res, next) => {
    console.log("[AI DEBUG] Incoming classify-text request");
    next();
  },
  auth,
  logAuthPassed,
  adminOnly,
  logAdminPassed,
  async (req, res) => {
    console.log("[AI DEBUG] Text route reached");

    try {
      const {
        title = "",
        description = "",
      } = req.body || {};

      const text = `${title}\n${description}`.trim();

      if (!text) {
        return res.status(400).json({
          success: false,
          message:
            "A project title or description is required.",
        });
      }

      console.log("[AI DEBUG] Starting text classification");

      const data = await buildClassification(text);

      console.log("[AI DEBUG] Text classification completed");

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error(
        "[AI DEBUG] Text classification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message || "Text classification failed.",
      });
    }
  }
);

router.post(
  "/classify-file",
  (req, res, next) => {
    console.log("========================================");
    console.log("[AI DEBUG] Incoming classify-file request");
    console.log("[AI DEBUG] Method:", req.method);
    console.log("[AI DEBUG] Content-Type:", req.headers["content-type"]);
    next();
  },
  auth,
  logAuthPassed,
  adminOnly,
  logAdminPassed,
  handleFileUpload,
  async (req, res) => {
    console.log("[AI DEBUG] File route reached");

    try {
      if (!req.file) {
        console.error("[AI DEBUG] No file received");

        return res.status(400).json({
          success: false,
          message: "Please upload a PDF or TXT file.",
        });
      }

      console.log(
        "[AI DEBUG] File received:",
        req.file.originalname
      );
      console.log(
        "[AI DEBUG] File size:",
        req.file.size
      );
      console.log(
        "[AI DEBUG] File MIME type:",
        req.file.mimetype
      );

      let text = "";

      if (req.file.mimetype === "application/pdf") {
        console.log("[AI DEBUG] Extracting PDF text");

        text = await extractPdfText(req.file.buffer);

        console.log("[AI DEBUG] PDF extraction finished");
      } else if (req.file.mimetype === "text/plain") {
        console.log("[AI DEBUG] Reading TXT file");

        text = req.file.buffer.toString("utf-8");

        console.log("[AI DEBUG] TXT reading finished");
      }

      console.log(
        "[AI DEBUG] Extracted character count:",
        text.length
      );

      if (!text.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "No readable text was found. The PDF may be scanned or contain no selectable text.",
        });
      }

      console.log("[AI DEBUG] Starting file classification");

      const data = await buildClassification(text);

      console.log("[AI DEBUG] File classification completed");

      return res.json({
        success: true,
        filename: req.file.originalname,
        data,
      });
    } catch (error) {
      console.error(
        "[AI DEBUG] File classification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "File classification failed. Check the server terminal.",
      });
    }
  }
);

module.exports = router;