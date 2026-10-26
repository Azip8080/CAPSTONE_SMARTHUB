
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const KnowledgeArticle = require("../models/KnowledgeArticle");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const uploadDir = path.join(__dirname, "../uploads/knowledge");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDir),
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    callback(null, `knowledge-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});

const allowedImageTypes = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

const allowedDocumentTypes = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const upload = multer({
  storage,
  limits: {
    files: 11,
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();

    const isPhoto =
      file.fieldname === "photos" &&
      allowedImageTypes[ext] === file.mimetype;

    const isDocument =
      file.fieldname === "document" &&
      allowedDocumentTypes[ext] === file.mimetype;

    if (!isPhoto && !isDocument) {
      return callback(
        new Error("Photos must be JPG, PNG, or WebP. Documents must be PDF, TXT, or DOCX.")
      );
    }

    callback(null, true);
  },
});

const resourceUpload = upload.fields([
  { name: "photos", maxCount: 10 },
  { name: "document", maxCount: 1 },
]);

function getPhotoPaths(files) {
  return (files || []).map(
    (file) => `/uploads/knowledge/${file.filename}`
  );
}

function getUploadedDocument(req) {
  const file = req.files?.document?.[0];

  if (!file) return null;

  return {
    path: `/uploads/knowledge/${file.filename}`,
    originalName: path.basename(file.originalname),
    mimeType: file.mimetype,
  };
}

function removeFile(filePath) {
  if (!filePath) return;

  const filename = path.basename(filePath);
  const fullPath = path.join(uploadDir, filename);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

function removeUploadedFiles(files) {
  if (!files) return;

  for (const group of Object.values(files)) {
    for (const file of group) {
      removeFile(`/uploads/knowledge/${file.filename}`);
    }
  }
}

function uploadResources(req, res, next) {
  resourceUpload(req, res, (err) => {
    if (err) {
      removeUploadedFiles(req.files);

      return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        success: false,
        message: err.message || "Upload failed.",
      });
    }

    next();
  });
}

router.get("/", async (req, res) => {
  try {
    const articles = await KnowledgeArticle.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: articles,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/:id/document", auth, adminOnly, async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);

    if (!article?.document?.path) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    const filename = path.basename(article.document.path);
    const fullPath = path.join(uploadDir, filename);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: "Document file is missing from storage.",
      });
    }

    return res.download(
      fullPath,
      article.document.originalName || filename
    );
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Unable to download document.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const article = await KnowledgeArticle.findById(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    return res.json({
      success: true,
      data: article,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post("/", auth, adminOnly, uploadResources, async (req, res) => {
  try {
    const document = getUploadedDocument(req);

    const article = await KnowledgeArticle.create({
      title: req.body.title,
      summary: req.body.summary,
      content: req.body.content,
      sdgTag: req.body.sdgTag,
      category: req.body.category || "Guide",
      readTime: req.body.readTime || "5",
      photos: getPhotoPaths(req.files?.photos),
      document: document || undefined,
      createdBy: req.user.id,
    });

    return res.status(201).json({
      success: true,
      data: article,
    });
  } catch (err) {
    removeUploadedFiles(req.files);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/:id", auth, adminOnly, uploadResources, async (req, res) => {
  let newDocument = null;

  try {
    const article = await KnowledgeArticle.findById(req.params.id);

    if (!article) {
      removeUploadedFiles(req.files);

      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    const oldPhotos = article.photos || [];

    let existingPhotos = oldPhotos;

    if (req.body.existingPhotos !== undefined) {
      try {
        const parsed = JSON.parse(req.body.existingPhotos);
        existingPhotos = Array.isArray(parsed) ? parsed : [];
      } catch {
        existingPhotos = [];
      }
    }

    const validExistingPhotos = existingPhotos.filter((photo) =>
      oldPhotos.includes(photo)
    );

    const uploadedPhotos = getPhotoPaths(req.files?.photos);

    const removedPhotos = oldPhotos.filter(
      (photo) => !validExistingPhotos.includes(photo)
    );

    const previousDocument = article.document?.toObject
      ? article.document.toObject()
      : { ...(article.document || {}) };

    newDocument = getUploadedDocument(req);

    article.title = req.body.title ?? article.title;
    article.summary = req.body.summary ?? article.summary;
    article.content = req.body.content ?? article.content;
    article.sdgTag = req.body.sdgTag ?? article.sdgTag;
    article.category = req.body.category ?? article.category;
    article.readTime = req.body.readTime ?? article.readTime;
    article.photos = [...validExistingPhotos, ...uploadedPhotos];

    if (newDocument) {
      article.document = newDocument;
    }

    await article.save();

    removedPhotos.forEach(removeFile);

    if (newDocument && previousDocument.path) {
      removeFile(previousDocument.path);
    }

    return res.json({
      success: true,
      data: article,
    });
  } catch (err) {
    removeUploadedFiles(req.files);

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const article = await KnowledgeArticle.findByIdAndDelete(req.params.id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found.",
      });
    }

    (article.photos || []).forEach(removeFile);
    removeFile(article.document?.path);

    return res.json({
      success: true,
      message: "Article deleted.",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
