
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dns = require("dns").promises;
const net = require("net");

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

function escapeHtml(value = "") {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function decodeHtml(value = "") {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function getMeta(html, property) {
  const escaped = property.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtml(match[1]);
  }

  return "";
}

function getYouTubeId(value) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (
      host === "youtube.com" ||
      host === "m.youtube.com" ||
      host === "youtube-nocookie.com"
    ) {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v") || "";
      }

      const match = url.pathname.match(/^\/(?:shorts|embed|live)\/([^/?]+)/);
      return match?.[1] || "";
    }
  } catch {
    return "";
  }

  return "";
}

function getYouTubeType(value) {
  try {
    const url = new URL(value);
    return url.pathname.startsWith("/shorts/") ? "shorts" : "youtube";
  } catch {
    return "youtube";
  }
}

function isPrivateAddress(address) {
  if (net.isIPv4(address)) {
    const parts = address.split(".").map(Number);
    const [a, b] = parts;

    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      a >= 224 ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127)
    );
  }

  if (net.isIPv6(address)) {
    const normalized = address.toLowerCase();

    return (
      normalized === "::1" ||
      normalized === "::" ||
      normalized.startsWith("fc") ||
      normalized.startsWith("fd") ||
      normalized.startsWith("fe80") ||
      normalized.startsWith("::ffff:")
    );
  }

  return true;
}

async function validatePublicUrl(value) {
  let url;

  try {
    url = new URL(value);
  } catch {
    throw new Error("Please enter a valid URL.");
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP and HTTPS links are allowed.");
  }

  if (url.username || url.password) {
    throw new Error("URLs containing login credentials are not allowed.");
  }

  const hostname = url.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local")
  ) {
    throw new Error("This URL is not allowed.");
  }

  const addresses = await dns.lookup(hostname, { all: true });

  if (!addresses.length || addresses.some((item) => isPrivateAddress(item.address))) {
    throw new Error("This URL points to a restricted network address.");
  }

  return url;
}

async function fetchArticleMetadata(value) {
  let url = await validatePublicUrl(value);

  for (let attempt = 0; attempt < 4; attempt += 1) {
    const response = await fetch(url, {
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; SDGSmartHub/1.0)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");

      if (!location) throw new Error("The website returned an invalid redirect.");

      url = await validatePublicUrl(new URL(location, url).toString());
      continue;
    }

    if (!response.ok) {
      throw new Error("The website could not provide its metadata.");
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      throw new Error("The supplied link does not return an HTML article page.");
    }

    const html = await response.text();

    if (html.length > 2 * 1024 * 1024) {
      throw new Error("The article page is too large to preview.");
    }

    const title =
      getMeta(html, "og:title") ||
      getMeta(html, "twitter:title") ||
      decodeHtml(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "").trim();

    const summary =
      getMeta(html, "og:description") ||
      getMeta(html, "description") ||
      getMeta(html, "twitter:description");

    const thumbnailUrl =
      getMeta(html, "og:image") ||
      getMeta(html, "twitter:image");

    return {
      title,
      summary,
      thumbnailUrl: thumbnailUrl
        ? new URL(thumbnailUrl, url).toString()
        : "",
      sourceUrl: url.toString(),
    };
  }

  throw new Error("The website redirected too many times.");
}

router.post("/metadata/preview", async (req, res) => {
  try {
    const sourceUrl = String(req.body.url || "").trim();

    if (!sourceUrl) {
      return res.status(400).json({
        success: false,
        message: "Please enter a URL.",
      });
    }

    const youtubeId = getYouTubeId(sourceUrl);

    if (youtubeId) {
      const type = getYouTubeType(sourceUrl);
      const endpoint = `https://www.youtube.com/oembed?url=${encodeURIComponent(sourceUrl)}&format=json`;

      const response = await fetch(endpoint, {
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) {
        throw new Error("Unable to retrieve YouTube video information.");
      }

      const metadata = await response.json();

      return res.json({
        success: true,
        data: {
          resourceType: type,
          sourceUrl,
          embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
          thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
          title: metadata.title || "",
          summary: `Video by ${metadata.author_name || "YouTube creator"}`,
          content: "",
        },
      });
    }

    const metadata = await fetchArticleMetadata(sourceUrl);

    return res.json({
      success: true,
      data: {
        resourceType: "article",
        sourceUrl: metadata.sourceUrl,
        embedUrl: "",
        thumbnailUrl: metadata.thumbnailUrl,
        title: metadata.title,
        summary: metadata.summary,
        content: "",
      },
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "Unable to retrieve resource information.",
    });
  }
});

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
    const resourceType = req.body.resourceType || "uploaded";
    const document = getUploadedDocument(req);

    if (resourceType !== "uploaded" && !req.body.sourceUrl) {
      removeUploadedFiles(req.files);
      return res.status(400).json({
        success: false,
        message: "A resource URL is required.",
      });
    }

    const article = await KnowledgeArticle.create({
  title: req.body.title,
  summary: req.body.summary || "",
  content: req.body.content || "",
  sdgTag: req.body.sdgTag || "",
  sdgTags: req.body.sdgTags
    ? JSON.parse(req.body.sdgTags)
    : [],
  category: req.body.category || "Guide",
  readTime: req.body.readTime || "5 min read",
  resourceType,
  sourceUrl: req.body.sourceUrl || "",
  embedUrl: req.body.embedUrl || "",
  thumbnailUrl: req.body.thumbnailUrl || "",
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
  try {
    const article = await KnowledgeArticle.findById(req.params.id);

    if (!article) {
      removeUploadedFiles(req.files);

      return res.status(404).json({
        success: false,
        message: "Resource not found.",
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

    const newDocument = getUploadedDocument(req);

    article.title = req.body.title ?? article.title;
    article.summary = req.body.summary ?? article.summary;
    article.content = req.body.content ?? article.content;
    article.sdgTag = req.body.sdgTag ?? article.sdgTag;
    article.sdgTags = req.body.sdgTags
      ? JSON.parse(req.body.sdgTags)
      : article.sdgTags;
    article.category = req.body.category ?? article.category;
    article.readTime = req.body.readTime ?? article.readTime;
    article.resourceType = req.body.resourceType || article.resourceType;
    article.sourceUrl = req.body.sourceUrl ?? article.sourceUrl;
    article.embedUrl = req.body.embedUrl ?? article.embedUrl;
    article.thumbnailUrl = req.body.thumbnailUrl ?? article.thumbnailUrl;
    article.photos = [...validExistingPhotos, ...uploadedPhotos];

    if (newDocument) {
      article.document = newDocument;
    } else if (req.body.keepExistingDocument === "false") {
      article.document = undefined;
    }

    await article.save();

    removedPhotos.forEach(removeFile);

    if (
      (newDocument || req.body.keepExistingDocument === "false") &&
      previousDocument.path
    ) {
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
        message: "Resource not found.",
      });
    }

    (article.photos || []).forEach(removeFile);
    removeFile(article.document?.path);

    return res.json({
      success: true,
      message: "Resource deleted.",
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
