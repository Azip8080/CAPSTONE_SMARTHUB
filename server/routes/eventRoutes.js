
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();
const Event = require("../models/Event");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const { logActivity } = require("../utils/activityLogger");

const uploadDir = path.join(__dirname, "../uploads/events");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) =>
    callback(null, uploadDir),
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();

    callback(
      null,
      `event-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`
    );
  },
});

const allowedTypes = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const upload = multer({
  storage,
  limits: {
    files: 1,
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes[ext] !== file.mimetype) {
      return callback(
        new Error("Documents must be PDF, TXT, or DOCX.")
      );
    }

    callback(null, true);
  },
});

function documentFromRequest(req) {
  if (!req.file) return null;

  return {
    path: `/uploads/events/${req.file.filename}`,
    originalName: path.basename(req.file.originalname),
    mimeType: req.file.mimetype,
  };
}

function removeDocument(document) {
  if (!document?.path) return;

  const filename = path.basename(document.path);
  const fullPath = path.join(uploadDir, filename);

  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
}

function uploadDocument(req, res, next) {
  upload.single("document")(req, res, (err) => {
    if (err) {
      return res
        .status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400)
        .json({
          success: false,
          message: err.message || "Document upload failed.",
        });
    }

    next();
  });
}

// Event visibility:
// Admins see all events.
// Community members see their own barangay and "All Barangays" events.
// Events with a missing or empty barangay are not shown to community members.
function getEventScope(req) {
  if (req.user?.role === "admin") {
    return {};
  }

  const barangay = req.user?.barangay?.trim();

  if (!barangay) {
    const error = new Error(
      "Your account does not have a registered barangay. Contact an administrator."
    );
    error.status = 403;
    throw error;
  }

  const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const barangayPattern = new RegExp(
    `^\\s*${escapeRegex(barangay)}\\s*$`,
    "i"
  );

  return {
    $or: [
      { barangay: barangayPattern },
      { barangay: /^\s*All Barangays\s*$/i },
    ],
  };
}

function sendRouteError(res, err, fallbackMessage) {
  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  console.error("[EVENT ROUTE ERROR]", err);

  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
}

// List events visible to the authenticated user.
router.get("/", auth, async (req, res) => {
  try {
    const scope = getEventScope(req);
    const events = await Event.find(scope).sort({ date: 1 });

    return res.json({
      success: true,
      data: events,
    });
  } catch (err) {
    return sendRouteError(
      res,
      err,
      "Unable to retrieve events."
    );
  }
});

// Download event documents: admin-only.
router.get("/:id/document", auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event?.document?.path) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    const filename = path.basename(event.document.path);
    const fullPath = path.join(uploadDir, filename);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({
        success: false,
        message: "Document file is missing from storage.",
      });
    }

    return res.download(
      fullPath,
      event.document.originalName || filename
    );
  } catch (err) {
    console.error("[DOWNLOAD EVENT DOCUMENT ERROR]", err);

    return res.status(500).json({
      success: false,
      message: "Unable to download document.",
    });
  }
});

// Fetch one event only if it is visible to this user.
router.get("/:id", auth, async (req, res) => {
  try {
    const scope = getEventScope(req);

    const event = await Event.findOne({
      _id: req.params.id,
      ...scope,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    return res.json({
      success: true,
      data: event,
    });
  } catch (err) {
    return sendRouteError(
      res,
      err,
      "Unable to retrieve event."
    );
  }
});

// Create events: admin-only.
router.post(
  "/",
  auth,
  adminOnly,
  uploadDocument,
  async (req, res) => {
    let savedDocument = null;

    try {
      savedDocument = documentFromRequest(req);

      const event = await Event.create({
        title: req.body.title,
        description: req.body.description,
        location: req.body.location,
        barangay:
          typeof req.body.barangay === "string" &&
          req.body.barangay.trim()
            ? req.body.barangay.trim()
            : "All Barangays",
        date: req.body.date,
        sdgTag: req.body.sdgTag,
        document: savedDocument || undefined,
      });

      await logActivity({
        actor: req.user.id,
        action: "created",
        entityType: "event",
        entityId: event._id,
        entityTitle: event.title,
        details: `Created an event for ${event.barangay}.`,
      });

      return res.status(201).json({
        success: true,
        data: event,
      });
    } catch (err) {
      if (savedDocument) {
        removeDocument(savedDocument);
      } else if (req.file) {
        removeDocument({
          path: `/uploads/events/${req.file.filename}`,
        });
      }

      if (err.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      console.error("[CREATE EVENT ERROR]", err);

      return res.status(400).json({
        success: false,
        message: err.message || "Unable to create event.",
      });
    }
  }
);

// Update events: admin-only.
router.put(
  "/:id",
  auth,
  adminOnly,
  uploadDocument,
  async (req, res) => {
    let newDocument = null;

    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        if (req.file) {
          removeDocument({
            path: `/uploads/events/${req.file.filename}`,
          });
        }

        return res.status(404).json({
          success: false,
          message: "Event not found.",
        });
      }

      const previousDocument = event.document?.toObject
        ? event.document.toObject()
        : { ...(event.document || {}) };

      newDocument = documentFromRequest(req);

      event.title = req.body.title ?? event.title;
      event.description =
        req.body.description ?? event.description;
      event.location = req.body.location ?? event.location;
      event.date = req.body.date ?? event.date;
      event.sdgTag = req.body.sdgTag ?? event.sdgTag;

      if (typeof req.body.barangay === "string") {
        event.barangay =
          req.body.barangay.trim() || "All Barangays";
      }

      if (newDocument) {
        event.document = newDocument;
      }

      await event.save();

      if (newDocument && previousDocument.path) {
        removeDocument(previousDocument);
      }

      await logActivity({
        actor: req.user.id,
        action: "updated",
        entityType: "event",
        entityId: event._id,
        entityTitle: event.title,
        details: `Updated event for ${event.barangay}.`,
      });

      return res.json({
        success: true,
        data: event,
      });
    } catch (err) {
      if (newDocument) {
        removeDocument(newDocument);
      } else if (req.file) {
        removeDocument({
          path: `/uploads/events/${req.file.filename}`,
        });
      }

      if (err.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      console.error("[UPDATE EVENT ERROR]", err);

      return res.status(400).json({
        success: false,
        message: err.message || "Unable to update event.",
      });
    }
  }
);

// Delete events: admin-only.
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    removeDocument(event.document);

    await logActivity({
      actor: req.user.id,
      action: "deleted",
      entityType: "event",
      entityId: event._id,
      entityTitle: event.title,
      details: "Deleted an event.",
    });

    return res.json({
      success: true,
      message: "Event deleted.",
    });
  } catch (err) {
    console.error("[DELETE EVENT ERROR]", err);

    return res.status(400).json({
      success: false,
      message: "Unable to delete event.",
    });
  }
});

module.exports = router;
