
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const Event = require("../models/Event");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const { logActivity } = require("../utils/activityLogger");

const uploadDir = path.join(__dirname, "../uploads/events");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDir),
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

function uploadDocument(req, res, next) {
  upload.single("document")(req, res, (err) => {
    if (err) {
      return res.status(err.code === "LIMIT_FILE_SIZE" ? 413 : 400).json({
        success: false,
        message: err.message || "Document upload failed.",
      });
    }

    next();
  });
}

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
    try {
      fs.unlinkSync(fullPath);
    } catch (error) {
      console.error("Unable to remove event document:", error.message);
    }
  }
}

function removeUploadedFile(req) {
  if (!req.file) return;

  removeDocument({
    path: `/uploads/events/${req.file.filename}`,
  });
}

function parseBarangays(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed
        .map((item) => String(item).trim())
        .filter(Boolean);
    }
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueBarangays(values) {
  return [...new Set(values.filter(Boolean))];
}

function getEventBarangayData(req) {
  const isAdmin = req.user.role === "admin";

  const requestedBarangays = parseBarangays(req.body.barangays);
  const singleBarangay =
    typeof req.body.barangay === "string"
      ? req.body.barangay.trim()
      : "";

  if (!isAdmin) {
    const assignedBarangay = req.user.barangay?.trim();

    if (!assignedBarangay) {
      const error = new Error(
        "Your account does not have an assigned barangay."
      );
      error.status = 403;
      throw error;
    }

    return {
      barangay: assignedBarangay,
      barangays: [assignedBarangay],
    };
  }

  if (singleBarangay.toLowerCase() === "all barangays") {
    return {
      barangay: "All Barangays",
      barangays: [],
    };
  }

  const targets = uniqueBarangays([
    ...(singleBarangay ? [singleBarangay] : []),
    ...requestedBarangays,
  ]);

  return {
    barangay: targets[0] || "All Barangays",
    barangays: targets,
  };
}

async function createAuditLog(
  req,
  action,
  description,
  event,
  remarks = ""
) {
  try {
    const user = await User.findById(req.user.id).select(
      "_id fullName email role barangay"
    );

    if (!user) return;

    await AuditLog.create({
      user: user._id,
      userName: user.fullName,
      userEmail: user.email,
      userRole: user.role,
      barangay: user.barangay || "",
      action,
      description,
      targetId: event?._id || null,
      targetType: "Event",
      remarks,
      ipAddress: req.ip || "",
      userAgent: req.get("user-agent") || "",
    });
  } catch (error) {
    console.error("[EVENT AUDIT LOG ERROR]", error);
  }
}

function sendRouteError(res, err, fallbackMessage) {
  if (err.status === 403) {
    return res.status(403).json({
      success: false,
      message: err.message,
    });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
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

function getEventInput(req, existingEvent = {}) {
  const barangayData = getEventBarangayData(req);

  return {
    title: req.body.title ?? existingEvent.title,
    description: req.body.description ?? existingEvent.description,
    location: req.body.location ?? existingEvent.location,
    date: req.body.date ?? existingEvent.date,
    startTime: req.body.startTime ?? existingEvent.startTime ?? "",
    endTime: req.body.endTime ?? existingEvent.endTime ?? "",
    sdgTag: req.body.sdgTag ?? existingEvent.sdgTag,
    ...barangayData,
  };
}

router.get("/", async (req, res) => {
  try {
    const events = await Event.find({
      reviewStatus: "Approved",
      publicationStatus: "Published",
    }).sort({ date: 1 });

    return res.json({
      success: true,
      data: events,
    });
  } catch (err) {
    return sendRouteError(res, err, "Unable to retrieve events.");
  }
});

router.get("/my-submissions", auth, async (req, res) => {
  try {
    let query = {};

    if (req.user.role === "barangay_personnel") {
      query = {
        createdBy: req.user.id,
      };
    } else if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view these submissions.",
      });
    }

    const events = await Event.find(query).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: events,
    });
  } catch (err) {
    return sendRouteError(
      res,
      err,
      "Unable to retrieve your event submissions."
    );
  }
});

router.get("/admin/all", auth, adminOnly, async (req, res) => {
  try {
    const events = await Event.find().sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: events,
    });
  } catch (err) {
    return sendRouteError(res, err, "Unable to retrieve all events.");
  }
});

router.get("/admin/pending", auth, adminOnly, async (req, res) => {
  try {
    const events = await Event.find({
      reviewStatus: "Pending Review",
    }).sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: events,
    });
  } catch (err) {
    return sendRouteError(res, err, "Unable to retrieve pending events.");
  }
});

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
    return sendRouteError(res, err, "Unable to download event document.");
  }
});

router.patch("/:id/approve", auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    event.reviewStatus = "Approved";
    event.reviewRemarks = "";
    event.reviewedBy = req.user.id;
    event.reviewedAt = new Date();
    event.publicationStatus = "Published";
    event.publishedAt = new Date();

    await event.save();

    await logActivity({
      actor: req.user.id,
      action: "approved",
      entityType: "event",
      entityId: event._id,
      entityTitle: event.title,
      details: "Approved and published an event.",
    });

    await createAuditLog(
      req,
      "EVENT_APPROVED",
      `Approved and published event: ${event.title}.`,
      event
    );

    return res.json({
      success: true,
      message: "Event approved and published.",
      data: event,
    });
  } catch (err) {
    return sendRouteError(res, err, "Unable to approve event.");
  }
});

router.patch("/:id/reject", auth, adminOnly, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const remarks =
      typeof req.body.remarks === "string"
        ? req.body.remarks.trim()
        : "";

    if (!remarks) {
      return res.status(400).json({
        success: false,
        message: "Please provide a reason for rejecting this event.",
      });
    }

    event.reviewStatus = "Rejected";
    event.reviewRemarks = remarks;
    event.reviewedBy = req.user.id;
    event.reviewedAt = new Date();
    event.publicationStatus = "Draft";
    event.publishedAt = null;

    await event.save();

    await logActivity({
      actor: req.user.id,
      action: "rejected",
      entityType: "event",
      entityId: event._id,
      entityTitle: event.title,
      details: `Rejected an event. Remarks: ${remarks}`,
    });

    await createAuditLog(
      req,
      "EVENT_REJECTED",
      `Rejected event: ${event.title}.`,
      event,
      remarks
    );

    return res.json({
      success: true,
      message: "Event rejected.",
      data: event,
    });
  } catch (err) {
    return sendRouteError(res, err, "Unable to reject event.");
  }
});

router.post("/", auth, uploadDocument, async (req, res) => {
  let savedDocument = null;

  try {
    if (!["admin", "barangay_personnel"].includes(req.user.role)) {
      removeUploadedFile(req);

      return res.status(403).json({
        success: false,
        message: "You are not allowed to create events.",
      });
    }

    savedDocument = documentFromRequest(req);

    const eventData = getEventInput(req);
    const isAdmin = req.user.role === "admin";

    const event = await Event.create({
      ...eventData,
      document: savedDocument || undefined,
      createdBy: req.user.id,
      reviewStatus: isAdmin ? "Approved" : "Pending Review",
      reviewRemarks: "",
      reviewedBy: isAdmin ? req.user.id : null,
      reviewedAt: isAdmin ? new Date() : null,
      publicationStatus: isAdmin ? "Published" : "Draft",
      publishedAt: isAdmin ? new Date() : null,
    });

    await logActivity({
      actor: req.user.id,
      action: "created",
      entityType: "event",
      entityId: event._id,
      entityTitle: event.title,
      details: isAdmin
        ? "Created an approved event."
        : "Submitted an event for admin review.",
    });

    if (!isAdmin) {
      await createAuditLog(
        req,
        "EVENT_SUBMITTED",
        `Submitted event for review: ${event.title}.`,
        event
      );
    }

    return res.status(201).json({
      success: true,
      message: isAdmin
        ? "Event created successfully."
        : "Event submitted successfully and is awaiting admin review.",
      data: event,
    });
  } catch (err) {
    if (savedDocument) {
      removeDocument(savedDocument);
    } else {
      removeUploadedFile(req);
    }

    return sendRouteError(res, err, "Unable to create event.");
  }
});

router.put("/:id", auth, uploadDocument, async (req, res) => {
  let newDocument = null;

  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      removeUploadedFile(req);

      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = String(event.createdBy) === String(req.user.id);

    if (!isAdmin && !isOwner) {
      removeUploadedFile(req);

      return res.status(403).json({
        success: false,
        message: "You can only edit your own event submissions.",
      });
    }

    if (!isAdmin && event.reviewStatus === "Approved") {
      removeUploadedFile(req);

      return res.status(403).json({
        success: false,
        message: "Approved events cannot be edited by personnel.",
      });
    }

    const previousDocument = event.document?.toObject
      ? event.document.toObject()
      : { ...(event.document || {}) };

    newDocument = documentFromRequest(req);

    const eventData = getEventInput(req, event);

    Object.assign(event, eventData);

    if (newDocument) {
      event.document = newDocument;
    }

    if (!isAdmin) {
      event.reviewStatus = "Pending Review";
      event.reviewRemarks = "";
      event.reviewedBy = null;
      event.reviewedAt = null;
      event.publicationStatus = "Draft";
      event.publishedAt = null;
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
      details: isAdmin
        ? "Updated an event."
        : "Updated and resubmitted an event for review.",
    });

    await createAuditLog(
      req,
      "EVENT_UPDATED",
      isAdmin
        ? `Updated event: ${event.title}.`
        : `Updated and resubmitted event: ${event.title}.`,
      event
    );

    return res.json({
      success: true,
      message: isAdmin
        ? "Event updated successfully."
        : "Event updated and resubmitted for review.",
      data: event,
    });
  } catch (err) {
    if (newDocument) {
      removeDocument(newDocument);
    } else {
      removeUploadedFile(req);
    }

    return sendRouteError(res, err, "Unable to update event.");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found.",
      });
    }

    const isAdmin = req.user.role === "admin";
    const isOwner = String(event.createdBy) === String(req.user.id);

    if (!isAdmin && !isOwner) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this event.",
      });
    }

    if (!isAdmin && event.reviewStatus === "Approved") {
      return res.status(403).json({
        success: false,
        message: "Approved events cannot be deleted by personnel.",
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    removeDocument(event.document);

    await logActivity({
      actor: req.user.id,
      action: "deleted",
      entityType: "event",
      entityId: event._id,
      entityTitle: event.title,
      details: "Deleted an event.",
    });

    await createAuditLog(
      req,
      "EVENT_DELETED",
      `Deleted event: ${event.title}.`,
      event
    );

    return res.json({
      success: true,
      message: "Event deleted successfully.",
    });
  } catch (err) {
    return sendRouteError(res, err, "Unable to delete event.");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findOne({
      _id: req.params.id,
      reviewStatus: "Approved",
      publicationStatus: "Published",
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
    return sendRouteError(res, err, "Unable to retrieve event.");
  }
});

module.exports = router;
