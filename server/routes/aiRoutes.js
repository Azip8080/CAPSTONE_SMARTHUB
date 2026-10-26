
const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const path = require("path");

const UploadedDocument = require("../models/UploadedDocument");

const {
  saveDocument,
  getDocumentDownloadStream,
  deleteStoredDocument,
} = require("../utils/documentStorage");

const {
  generateSDGRelevance,
} = require("../ai/sdgRelevance");

const {
  findKeywordMatches,
} = require("../ai/keywordMatches");

const {
  classifyText,
} = require("../ai/classifier");

const {
  generateTags,
} = require("../ai/tagger");

const {
  detectMissingInformation,
} = require("../ai/missingInfo");

const {
  generateProjectSummary,
} = require("../ai/projectSummary");

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_RETURNED_TEXT = 100000;
const ALLOWED_TYPES = {
  "application/pdf": ".pdf",
  "text/plain": ".txt",
};

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_FILE_SIZE,
  },

  fileFilter: (req, file, callback) => {
    console.log(
      "[AI DEBUG] Checking file:",
      file.originalname
    );

    const extension = path.extname(
      file.originalname
    ).toLowerCase();

    if (
      ALLOWED_TYPES[file.mimetype] &&
      ALLOWED_TYPES[file.mimetype] === extension
    ) {
      return callback(null, true);
    }

    return callback(
      new Error(
        "Only PDF and TXT files are supported."
      )
    );
  },
});

function logAuthPassed(req, res, next) {
  console.log(
    "[AI DEBUG] Authentication passed"
  );
  next();
}

function logAdminPassed(req, res, next) {
  console.log(
    "[AI DEBUG] Admin authorization passed"
  );
  next();
}

function handleFileUpload(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (error) {
      console.error(
        "[AI DEBUG] Upload middleware error:",
        error.message
      );

      const tooLarge =
        error.code === "LIMIT_FILE_SIZE";

      return res.status(tooLarge ? 413 : 400).json({
        success: false,
        message: tooLarge
          ? "File is too large. Maximum size is 10 MB."
          : error.message || "File upload failed.",
      });
    }

    next();
  });
}

async function extractPdfText(buffer) {
  console.log(
    "[AI DEBUG] PDF extraction started"
  );

  if (typeof pdfParse === "function") {
    const parsed = await pdfParse(buffer);
    return parsed.text || "";
  }

  if (typeof pdfParse.PDFParse === "function") {
    const parser = new pdfParse.PDFParse({
      data: buffer,
    });

    try {
      const parsed = await parser.getText();
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

  console.log(
    `[AI] Analyzing full document: ${fullText.length} characters`
  );

  const result = await classifyText(fullText);

  const keywordMatches = findKeywordMatches(fullText);
  const automaticTags = generateTags(fullText);
  const missingInformation = detectMissingInformation(fullText);

  const sdgRelevance = generateSDGRelevance(
    fullText,
    result.tag || result.sdgTag,
    result.relatedSDGs,
    keywordMatches.evidenceBySDG
  );

  const projectSummary = generateProjectSummary(fullText);

  const extractedText = fullText.slice(0, MAX_RETURNED_TEXT);
  const returnedTextTruncated =
    fullText.length > MAX_RETURNED_TEXT;

  console.log(
    `[AI] Full text analyzed: ${fullText.length} characters`
  );

  console.log(
    `[AI] Text returned to frontend: ${extractedText.length} characters`
  );

  console.log(
    `[AI] Total processing time: ${Date.now() - startedAt} ms`
  );

  return {
    ...result,
    extractedText,
    keywordMatches,
    automaticTags,
    missingInformation,
    textTruncated: false,
    returnedTextTruncated,
    fullTextLength: fullText.length,
    sdgRelevance,
    projectSummary,
  };
}

router.post(
  "/classify-text",
  auth,
  adminOnly,
  async (req, res) => {
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
            "A title or description is required.",
        });
      }

      const data = await buildClassification(text);

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error(
        "[AI] Text classification error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Text classification failed.",
      });
    }
  }
);

/**
 * POST /api/ai/classify-file
 * Classify and store an original PDF/TXT file.
 * Admins only.
 */
router.post(
  "/classify-file",
  auth,
  adminOnly,
  handleFileUpload,
  async (req, res) => {
    let storedFile = null;
    let documentRecord = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Please upload a PDF or TXT file.",
        });
      }

      const file = req.file;
      let text = "";

      if (file.mimetype === "application/pdf") {
        text = await extractPdfText(file.buffer);
      } else if (file.mimetype === "text/plain") {
        text = file.buffer.toString("utf-8");
      }

      if (!text.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "No readable text was found. The PDF may be scanned or contain no selectable text.",
        });
      }

      // Run classification before storing the original.
      const data = await buildClassification(text);

      const originalName = path
        .basename(file.originalname)
        .replace(/[\r\n"]/g, "_");

      const storedName =
        `${Date.now()}-${originalName.replace(
          /[^a-zA-Z0-9._-]/g,
          "_"
        )}`;

      // Save original bytes to MongoDB GridFS.
      storedFile = await saveDocument(
        file.buffer,
        storedName,
        {
          originalName,
          mimeType: file.mimetype,
          uploadedBy: req.user.id,
          source: "AI Classifier",
        }
      );

      // Save searchable metadata.
      documentRecord = await UploadedDocument.create({
        originalName,
        storedName,
        gridFsId: storedFile.id,
        mimeType: file.mimetype,
        size: file.size,
        uploadedBy: req.user.id,
        source: "AI Classifier",
      });

      return res.json({
        success: true,
        filename: originalName,
        document: {
          id: documentRecord._id,
          originalName: documentRecord.originalName,
          mimeType: documentRecord.mimeType,
          size: documentRecord.size,
          uploadedAt: documentRecord.createdAt,
        },
        data,
      });
    } catch (error) {
      console.error(
        "[AI] File classification/storage error:",
        error
      );

      // If metadata creation failed, remove the stored GridFS file.
      if (storedFile?.id && !documentRecord) {
        try {
          await deleteStoredDocument(
            storedFile.id.toString()
          );
        } catch (cleanupError) {
          console.error(
            "[AI] GridFS cleanup failed:",
            cleanupError
          );
        }
      }

      return res.status(500).json({
        success: false,
        message:
          "File classification or storage failed. Check the backend logs.",
      });
    }
  }
);

/**
 * GET /api/ai/documents
 * List files uploaded through the AI classifier.
 * Admins only.
 */
router.get(
  "/documents",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const documents = await UploadedDocument.find({
        source: "AI Classifier",
      })
        .select(
          "originalName mimeType size uploadedBy destination destinationId createdAt"
        )
        .sort({ createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        data: documents,
      });
    } catch (error) {
      console.error(
        "[AI DOCUMENTS] Listing failed:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to retrieve uploaded documents.",
      });
    }
  }
);

/**
 * GET /api/ai/documents/:id/download
 * Download an original stored file.
 * Admins only.
 */
router.get(
  "/documents/:id/download",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!/^[a-fA-F0-9]{24}$/.test(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid document ID.",
        });
      }

      const document = await UploadedDocument.findOne({
        _id: id,
        source: "AI Classifier",
      }).lean();

      if (!document) {
        return res.status(404).json({
          success: false,
          message: "Uploaded document not found.",
        });
      }

      const stream = getDocumentDownloadStream(
        document.gridFsId.toString()
      );

      let responseStarted = false;

      stream.once("file", () => {
        responseStarted = true;

        res.setHeader(
          "Content-Type",
          document.mimeType === "application/pdf"
            ? "application/pdf"
            : "text/plain; charset=utf-8"
        );

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${document.originalName.replace(
            /["\\\r\n]/g,
            "_"
          )}"`
        );

        res.setHeader(
          "X-Content-Type-Options",
          "nosniff"
        );

        stream.pipe(res);
      });

      stream.once("error", (error) => {
        console.error(
          "[AI DOCUMENTS] Download failed:",
          error
        );

        if (!responseStarted && !res.headersSent) {
          return res.status(404).json({
            success: false,
            message:
              "Stored file could not be found.",
          });
        }

        if (!res.writableEnded) {
          res.destroy();
        }
      });
    } catch (error) {
      console.error(
        "[AI DOCUMENTS] Download request failed:",
        error
      );

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message:
            "Failed to download the document.",
        });
      }

      if (!res.writableEnded) {
        res.destroy();
      }
    }
  }
);

module.exports = router;
