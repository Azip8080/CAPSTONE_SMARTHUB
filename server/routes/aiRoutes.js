
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

const { generateSDGRelevance } = require("../ai/sdgRelevance");
const { findKeywordMatches } = require("../ai/keywordMatches");
const { classifyText } = require("../ai/classifier");
const { generateTags } = require("../ai/tagger");
const { detectMissingInformation } = require("../ai/missingInfo");
const { generateProjectSummary } = require("../ai/projectSummary");

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
    const extension = path.extname(file.originalname).toLowerCase();

    if (
      ALLOWED_TYPES[file.mimetype] &&
      ALLOWED_TYPES[file.mimetype] === extension
    ) {
      return callback(null, true);
    }

    return callback(
      new Error("Only PDF and TXT files are supported.")
    );
  },
});

function handleFileUpload(req, res, next) {
  upload.single("file")(req, res, (error) => {
    if (error) {
      const tooLarge = error.code === "LIMIT_FILE_SIZE";

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

async function buildClassification(text, options = {}) {
  const startedAt = Date.now();
  const fullText = String(text || "").trim();

  if (!fullText) {
    throw new Error("There is no text to classify.");
  }

  const result = await classifyText(fullText);
  const keywordMatches = findKeywordMatches(fullText);
  const automaticTags = generateTags(fullText);
  const missingInformation = detectMissingInformation(fullText);

  const primarySDG = result.tag || result.sdgTag || "";

  const sdgRelevance = generateSDGRelevance(
    fullText,
    primarySDG,
    result.relatedSDGs,
    keywordMatches.evidenceBySDG
  );

  const extractedText = fullText.slice(0, MAX_RETURNED_TEXT);
  const returnedTextTruncated =
    fullText.length > MAX_RETURNED_TEXT;

  const data = {
    ...result,
    extractedText,
    keywordMatches,
    automaticTags,
    missingInformation,
    textTruncated: false,
    returnedTextTruncated,
    fullTextLength: fullText.length,
    sdgRelevance,
  };

  if (options.includeProjectSummary === true) {
    data.projectSummary = generateProjectSummary(fullText);
  }

  console.log(
    `[AI] Classification completed: ${fullText.length} characters, ${
      Date.now() - startedAt
    } ms`
  );

  return data;
}

router.post(
  "/classify-text",
  express.json(),
  auth,
  adminOnly,
  async (req, res) => {
    try {
      console.log("[AI] Request body:", req.body);

      const title = String(req.body?.title || "").trim();
      const description = String(req.body?.description || "").trim();
      const submittedText = String(req.body?.text || "").trim();

      const text =
        submittedText ||
        [title, description].filter(Boolean).join("\n\n");

      if (!text.trim()) {
        return res.status(400).json({
          success: false,
          message: "A title or description is required.",
          receivedBody: req.body,
        });
      }

      const data = await buildClassification(text, {
        includeProjectSummary: false,
      });

      return res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("[AI] Text classification error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Text classification failed.",
      });
    }
  }
);

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
          message: "Please upload a PDF or TXT file.",
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

      const data = await buildClassification(text, {
        includeProjectSummary: false,
      });

      const originalName = path
        .basename(file.originalname)
        .replace(/[\r\n"]/g, "_");

      const safeName = originalName.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
      );

      const storedName = `${Date.now()}-${safeName}`;

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
      console.error("[AI] File classification/storage error:", error);

      if (storedFile?.id && !documentRecord) {
        try {
          await deleteStoredDocument(storedFile.id.toString());
        } catch (cleanupError) {
          console.error("[AI] GridFS cleanup failed:", cleanupError);
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
      console.error("[AI DOCUMENTS] Listing failed:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to retrieve uploaded documents.",
      });
    }
  }
);

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

        const safeFilename = document.originalName.replace(
          /["\\\r\n]/g,
          "_"
        );

        res.setHeader(
          "Content-Disposition",
          `attachment; filename="${safeFilename}"`
        );

        res.setHeader("X-Content-Type-Options", "nosniff");

        stream.pipe(res);
      });

      stream.once("error", (error) => {
        console.error("[AI DOCUMENTS] Download failed:", error);

        if (!responseStarted && !res.headersSent) {
          return res.status(404).json({
            success: false,
            message: "Stored file could not be found.",
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
          message: "Failed to download the document.",
        });
      }

      if (!res.writableEnded) {
        res.destroy();
      }
    }
  }
);

module.exports = router;
