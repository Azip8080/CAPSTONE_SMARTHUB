
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const Project = require("../models/Project");
const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const { logActivity } = require("../utils/activityLogger");

const uploadDir = path.join(__dirname, "../uploads/projects");

fs.mkdirSync(uploadDir, { recursive: true });

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const allowedDocuments = {
  ".pdf": "application/pdf",
  ".txt": "text/plain",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, uploadDir);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    callback(
      null,
      `project-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`
    );
  },
});

const upload = multer({
  storage,
  limits: {
    files: 11,
    fileSize: 20 * 1024 * 1024,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const isImage =
      file.fieldname === "photos" &&
      allowedExtensions.includes(extension) &&
      allowedMimeTypes.includes(file.mimetype);

    const isDocument =
      file.fieldname === "document" &&
      allowedDocuments[extension] === file.mimetype;

    if (isImage || isDocument) {
      return callback(null, true);
    }

    return callback(
      new Error(
        "Photos must be JPG, PNG, or WebP. Documents must be PDF, TXT, or DOCX."
      )
    );
  },
});

const projectUpload = upload.fields([
  { name: "photos", maxCount: 10 },
  { name: "document", maxCount: 1 },
]);

const editableFields = [
  "title",
  "description",
  "sdgTag",
  "sdgTags",
  "tags",
  "barangay",
  "status",
  "featured",
  "startDate",
  "endDate",
];

function getEditableFields(body) {
  const fields = {};

  for (const field of editableFields) {
    if (body[field] !== undefined) {
      fields[field] = body[field];
    }
  }

  for (const field of ["sdgTags", "tags"]) {
    if (typeof fields[field] === "string") {
      try {
        fields[field] = JSON.parse(fields[field]);
      } catch {
        fields[field] = [];
      }
    }
  }

  if (typeof fields.featured === "string") {
    fields.featured = fields.featured === "true";
  }

  return fields;
}

function getPhotoPaths(files = []) {
  return files.map((file) => `/uploads/projects/${file.filename}`);
}

function getUploadedDocument(req) {
  const file = req.files?.document?.[0];

  if (!file) return null;

  return {
    path: `/uploads/projects/${file.filename}`,
    originalName: path.basename(file.originalname),
    mimeType: file.mimetype,
  };
}

function removeProjectFile(filePath) {
  if (!filePath) return;

  const filename = path.basename(filePath);
  const fullPath = path.join(uploadDir, filename);

  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (error) {
      console.error("Unable to remove project file:", error.message);
    }
  }
}

function removeUploadedFiles(files) {
  if (!files) return;

  for (const group of Object.values(files)) {
    for (const file of group) {
      removeProjectFile(file.filename);
    }
  }
}

function handleUploadError(req, res, next) {
  projectUpload(req, res, (error) => {
    if (!error) return next();

    removeUploadedFiles(req.files);

    const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    return res.status(status).json({
      success: false,
      message: error.message || "Project upload failed.",
    });
  });
}

function parseExistingPhotos(value, fallback = []) {
  if (value === undefined) return fallback;
  if (Array.isArray(value)) return value;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function barangayRegex(barangay) {
  return {
    $regex: `^\\s*${escapeRegex(barangay)}\\s*$`,
    $options: "i",
  };
}

function getUserBarangay(req) {
  const barangay = req.user?.barangay?.trim();

  if (!barangay) {
    const error = new Error(
      "Your account does not have an assigned barangay. Contact an administrator."
    );

    error.status = 403;
    throw error;
  }

  return barangay;
}

function isBarangayPersonnel(req) {
  return req.user?.role === "barangay_personnel";
}

function canManageProject(req, project) {
  if (req.user?.role === "admin") return true;

  if (!isBarangayPersonnel(req)) return false;

  return (
    String(project.createdBy) === String(req.user.id) &&
    project.barangay?.trim().toLowerCase() ===
      req.user.barangay?.trim().toLowerCase()
  );
}

async function findDuplicateProject(title, barangay, excludeId = null) {
  const query = {
    title: {
      $regex: `^\\s*${escapeRegex(title.trim())}\\s*$`,
      $options: "i",
    },
    barangay: barangayRegex(barangay),
    reviewStatus: { $ne: "Rejected" },
  };

  if (excludeId) {
    query._id = { $ne: excludeId };
  }

  return Project.findOne(query);
}

async function createAuditLog(req, action, description, project, remarks = "") {
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
      targetId: project?._id || null,
      targetType: "Project",
      remarks,
      ipAddress: req.ip || "",
      userAgent: req.get("user-agent") || "",
    });
  } catch (error) {
    console.error("[PROJECT AUDIT LOG ERROR]", error);
  }
}

function sendError(res, error, fallbackMessage) {
  console.error(fallbackMessage, error);

  return res.status(error.status || 500).json({
    success: false,
    message: error.message || fallbackMessage,
  });
}

router.get("/admin/all", auth, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find().sort({ updatedAt: -1 });

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve projects.");
  }
});

router.get("/admin/pending", auth, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find({
      reviewStatus: "Pending Review",
    }).sort({ createdAt: 1 });

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve pending projects.");
  }
});

router.get("/my-submissions", auth, async (req, res) => {
  try {
    if (
      req.user.role !== "barangay_personnel" &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view these submissions.",
      });
    }

    const query =
      req.user.role === "admin"
        ? {}
        : {
            createdBy: req.user.id,
            barangay: barangayRegex(getUserBarangay(req)),
          };

    const projects = await Project.find(query)
      .sort({ updatedAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve your submissions.");
  }
});

router.post("/", auth, handleUploadError, async (req, res) => {
  try {
    if (
      req.user.role !== "admin" &&
      req.user.role !== "barangay_personnel"
    ) {
      removeUploadedFiles(req.files);

      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit projects.",
      });
    }

    const fields = getEditableFields(req.body);

    const barangay = isBarangayPersonnel(req)
      ? getUserBarangay(req)
      : fields.barangay?.trim();

    if (!barangay) {
      removeUploadedFiles(req.files);

      return res.status(400).json({
        success: false,
        message: "Please provide a barangay for this project.",
      });
    }

    if (!fields.title?.trim()) {
      removeUploadedFiles(req.files);

      return res.status(400).json({
        success: false,
        message: "Project title is required.",
      });
    }

    const duplicate = await findDuplicateProject(fields.title, barangay);

    if (duplicate) {
      removeUploadedFiles(req.files);

      return res.status(409).json({
        success: false,
        message:
          "A project with the same title already exists for this barangay.",
      });
    }

    const photos = getPhotoPaths(req.files?.photos || []);
    const document = getUploadedDocument(req);

    const project = await Project.create({
      ...fields,
      barangay,
      photos,
      document: document || undefined,
      reviewStatus: isBarangayPersonnel(req)
        ? "Pending Review"
        : "Approved",
      reviewRemarks: "",
      reviewedBy: null,
      reviewedAt: null,
      publicationStatus: "Draft",
      publishedAt: null,
      featured:
        req.user.role === "admin" ? fields.featured || false : false,
      createdBy: req.user.id,
    });

    await logActivity({
      actor: req.user.id,
      action: "created",
      entityType: "Project",
      entityId: project._id,
      entityTitle: project.title,
      details: isBarangayPersonnel(req)
        ? `Submitted a project for review from ${barangay}.`
        : "Created a new project draft.",
    });

    if (isBarangayPersonnel(req)) {
      await createAuditLog(
        req,
        "PROJECT_SUBMITTED",
        `${project.title} was submitted for review by ${req.user.role}.`,
        project
      );
    }

    return res.status(201).json({
      success: true,
      message: isBarangayPersonnel(req)
        ? "Project submitted successfully and is awaiting administrator review."
        : "Project saved as a draft.",
      data: project,
    });
  } catch (error) {
    removeUploadedFiles(req.files);
    return sendError(res, error, "Failed to create project.");
  }
});

router.patch("/:id/approve", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (project.reviewStatus === "Approved") {
      return res.status(400).json({
        success: false,
        message: "This project has already been approved.",
      });
    }

    project.reviewStatus = "Approved";
    project.reviewRemarks = "";
    project.reviewedBy = req.user.id;
    project.reviewedAt = new Date();
    project.publicationStatus = "Published";
    project.publishedAt = new Date();

    await project.save();

    await logActivity({
      actor: req.user.id,
      action: "approved",
      entityType: "Project",
      entityId: project._id,
      entityTitle: project.title,
      details: "Approved and published a submitted project.",
    });

    await createAuditLog(
      req,
      "PROJECT_APPROVED",
      `Approved and published project: ${project.title}.`,
      project
    );

    return res.json({
      success: true,
      message: "Project approved and published successfully.",
      data: project,
    });
  } catch (error) {
    return sendError(res, error, "Failed to approve project.");
  }
});

router.patch("/:id/reject", auth, adminOnly, async (req, res) => {
  try {
    const remarks =
      typeof req.body.remarks === "string"
        ? req.body.remarks.trim()
        : "";

    if (!remarks) {
      return res.status(400).json({
        success: false,
        message: "Please provide a reason for rejecting this project.",
      });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    project.reviewStatus = "Rejected";
    project.reviewRemarks = remarks;
    project.reviewedBy = req.user.id;
    project.reviewedAt = new Date();
    project.publicationStatus = "Draft";
    project.publishedAt = null;

    await project.save();

    await logActivity({
      actor: req.user.id,
      action: "rejected",
      entityType: "Project",
      entityId: project._id,
      entityTitle: project.title,
      details: `Rejected project submission. Remarks: ${remarks}`,
    });

    await createAuditLog(
      req,
      "PROJECT_REJECTED",
      `Rejected project submission: ${project.title}.`,
      project,
      remarks
    );

    return res.json({
      success: true,
      message: "Project submission rejected.",
      data: project,
    });
  } catch (error) {
    return sendError(res, error, "Failed to reject project.");
  }
});

router.patch("/:id/featured", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (
      project.reviewStatus !== "Approved" ||
      project.publicationStatus !== "Published"
    ) {
      return res.status(400).json({
        success: false,
        message: "Only approved and published projects can be featured.",
      });
    }

    project.featured =
      req.body.featured === true || req.body.featured === "true";

    await project.save();

    await logActivity({
      actor: req.user.id,
      action: "updated",
      entityType: "Project",
      entityId: project._id,
      entityTitle: project.title,
      details: project.featured
        ? "Added project to showcase."
        : "Removed project from showcase.",
    });

    await createAuditLog(
      req,
      "PROJECT_UPDATED",
      `${project.title} was ${project.featured ? "added to" : "removed from"} the featured projects.`,
      project
    );

    return res.json({
      success: true,
      message: project.featured
        ? "Project added to showcase."
        : "Project removed from showcase.",
      data: project,
    });
  } catch (error) {
    return sendError(res, error, "Failed to update showcase status.");
  }
});

router.put("/:id", auth, handleUploadError, async (req, res) => {
  let oldDocumentPath = null;

  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      removeUploadedFiles(req.files);

      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (!canManageProject(req, project)) {
      removeUploadedFiles(req.files);

      return res.status(403).json({
        success: false,
        message: "You are not authorized to edit this project.",
      });
    }

    if (
      isBarangayPersonnel(req) &&
      project.reviewStatus === "Approved"
    ) {
      removeUploadedFiles(req.files);

      return res.status(403).json({
        success: false,
        message:
          "Approved projects cannot be edited by Barangay Personnel. Contact the administrator.",
      });
    }

    const fields = getEditableFields(req.body);

    if (isBarangayPersonnel(req)) {
      fields.barangay = getUserBarangay(req);
      delete fields.featured;
    }

    const newTitle = fields.title || project.title;
    const newBarangay = fields.barangay || project.barangay;

    const duplicate = await findDuplicateProject(
      newTitle,
      newBarangay,
      project._id
    );

    if (duplicate) {
      removeUploadedFiles(req.files);

      return res.status(409).json({
        success: false,
        message:
          "A project with the same title already exists for this barangay.",
      });
    }

    const oldPhotos = project.photos || [];

    const existingPhotos = parseExistingPhotos(
      req.body.existingPhotos,
      oldPhotos
    );

    const validExistingPhotos = existingPhotos.filter(
      (photo) =>
        typeof photo === "string" && oldPhotos.includes(photo)
    );

    const uploadedPhotos = getPhotoPaths(req.files?.photos || []);

    const removedPhotos = oldPhotos.filter(
      (photo) => !validExistingPhotos.includes(photo)
    );

    fields.photos = [...validExistingPhotos, ...uploadedPhotos];

    const newDocument = getUploadedDocument(req);

    const shouldRemoveDocument =
      req.body.removeDocument === true ||
      req.body.removeDocument === "true";

    oldDocumentPath = project.document?.path || null;

    if (newDocument) {
      project.document = newDocument;
    } else if (shouldRemoveDocument) {
      project.document = undefined;
    }

    Object.assign(project, fields);

    if (isBarangayPersonnel(req)) {
      project.reviewStatus = "Pending Review";
      project.reviewRemarks = "";
      project.reviewedBy = null;
      project.reviewedAt = null;
      project.publicationStatus = "Draft";
      project.publishedAt = null;
      project.featured = false;
    }

    await project.save();

    removedPhotos.forEach(removeProjectFile);

    if (oldDocumentPath && (newDocument || shouldRemoveDocument)) {
      removeProjectFile(oldDocumentPath);
    }

    await logActivity({
      actor: req.user.id,
      action: "updated",
      entityType: "Project",
      entityId: project._id,
      entityTitle: project.title,
      details: isBarangayPersonnel(req)
        ? "Updated and resubmitted a project for administrator review."
        : "Updated project details.",
    });

    await createAuditLog(
      req,
      "PROJECT_UPDATED",
      isBarangayPersonnel(req)
        ? `Updated and resubmitted project: ${project.title}.`
        : `Updated project: ${project.title}.`,
      project
    );

    return res.json({
      success: true,
      message: isBarangayPersonnel(req)
        ? "Project updated and resubmitted for review."
        : "Project details updated.",
      data: project,
    });
  } catch (error) {
    removeUploadedFiles(req.files);
    return sendError(res, error, "Failed to update project.");
  }
});

router.patch("/:id/publish", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (project.reviewStatus !== "Approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved projects can be published.",
      });
    }

    const requiredFields = [
      "title",
      "description",
      "sdgTag",
      "barangay",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        typeof project[field] !== "string" ||
        !project[field].trim()
    );

    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        message:
          "Complete the required project details before publishing.",
        missingFields,
      });
    }

    project.publicationStatus = "Published";
    project.publishedAt = new Date();

    await project.save();

    await logActivity({
      actor: req.user.id,
      action: "published",
      entityType: "Project",
      entityId: project._id,
      entityTitle: project.title,
      details: "Published a project.",
    });

    await createAuditLog(
      req,
      "PROJECT_UPDATED",
      `Published project: ${project.title}.`,
      project
    );

    return res.json({
      success: true,
      message: "Project published successfully.",
      data: project,
    });
  } catch (error) {
    return sendError(res, error, "Failed to publish project.");
  }
});

router.patch("/:id/unpublish", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    project.publicationStatus = "Draft";
    project.publishedAt = null;

    await project.save();

    await logActivity({
      actor: req.user.id,
      action: "unpublished",
      entityType: "Project",
      entityId: project._id,
      entityTitle: project.title,
      details: "Returned a project to draft status.",
    });

    await createAuditLog(
      req,
      "PROJECT_UPDATED",
      `Unpublished project: ${project.title}.`,
      project
    );

    return res.json({
      success: true,
      message: "Project returned to draft status.",
      data: project,
    });
  } catch (error) {
    return sendError(res, error, "Failed to unpublish project.");
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (!canManageProject(req, project)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this project.",
      });
    }

    if (
      isBarangayPersonnel(req) &&
      project.reviewStatus === "Approved"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "Approved projects cannot be deleted by Barangay Personnel.",
      });
    }

    await Project.findByIdAndDelete(project._id);

    (project.photos || []).forEach(removeProjectFile);
    removeProjectFile(project.document?.path);

    await logActivity({
      actor: req.user.id,
      action: "deleted",
      entityType: "Project",
      entityId: project._id,
      entityTitle: project.title,
      details: "Deleted a project.",
    });

    await createAuditLog(
      req,
      "PROJECT_DELETED",
      `Deleted project: ${project.title}.`,
      project
    );

    return res.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    return sendError(res, error, "Failed to delete project.");
  }
});

router.get(
  "/barangay/:barangay/published",
  auth,
  async (req, res) => {
    try {
      const requestedBarangay = String(
        req.params.barangay || ""
      ).trim();

      if (!requestedBarangay) {
        return res.status(400).json({
          success: false,
          message: "Barangay name is required.",
        });
      }

      let barangayToQuery;

      if (req.user.role === "admin") {
        barangayToQuery = requestedBarangay;
      } else {
        const userBarangay = getUserBarangay(req);

        const requestedMatchesUser =
          requestedBarangay.localeCompare(userBarangay, undefined, {
            sensitivity: "accent",
          }) === 0;

        if (!requestedMatchesUser) {
          return res.status(403).json({
            success: false,
            message:
              "You are not authorized to view projects from this barangay.",
          });
        }

        barangayToQuery = userBarangay;
      }

      const projects = await Project.find({
        publicationStatus: "Published",
        reviewStatus: "Approved",
        barangay: barangayRegex(barangayToQuery),
      })
        .sort({ publishedAt: -1, createdAt: -1 })
        .lean();

      return res.json({
        success: true,
        data: projects,
      });
    } catch (error) {
      return sendError(res, error, "Failed to retrieve published projects.");
    }
  }
);

router.get("/barangay-ranking", async (req, res) => {
  try {
    const projects = await Project.find({
      publicationStatus: "Published",
      reviewStatus: "Approved",
      barangay: {
        $exists: true,
        $nin: ["", null],
      },
    })
      .select("barangay sdgTag sdgTags")
      .lean();

    const barangays = new Map();

    function normalizeSdg(value) {
      if (typeof value === "string") {
        return value.trim();
      }

      if (typeof value === "number") {
        return `SDG ${value}`;
      }

      if (value && typeof value === "object") {
        const label =
          value.label ||
          value.name ||
          value.title ||
          value.value ||
          value.tag ||
          value.sdgTag;

        return typeof label === "string" ? label.trim() : "";
      }

      return "";
    }

    for (const project of projects) {
      const barangay = project.barangay?.trim();

      if (!barangay) continue;

      if (!barangays.has(barangay)) {
        barangays.set(barangay, {
          barangay,
          projectCount: 0,
          sdgTags: new Set(),
        });
      }

      const entry = barangays.get(barangay);
      entry.projectCount += 1;

      let arrayTags = [];

      if (Array.isArray(project.sdgTags)) {
        arrayTags = project.sdgTags;
      } else if (typeof project.sdgTags === "string") {
        try {
          const parsed = JSON.parse(project.sdgTags);

          arrayTags = Array.isArray(parsed)
            ? parsed
            : [project.sdgTags];
        } catch {
          arrayTags = [project.sdgTags];
        }
      }

      const validArrayTags = arrayTags
        .map(normalizeSdg)
        .filter(Boolean);

      const singleTag = normalizeSdg(project.sdgTag);

      const tagsToAdd = validArrayTags.length
        ? validArrayTags
        : singleTag
          ? [singleTag]
          : [];

      for (const tag of tagsToAdd) {
        entry.sdgTags.add(tag);
      }
    }

    const data = [...barangays.values()]
      .map((entry) => {
        const sdgTags = [...entry.sdgTags].sort((a, b) =>
          a.localeCompare(b, undefined, { numeric: true })
        );

        return {
          barangay: entry.barangay,
          projectCount: entry.projectCount,
          sdgTags,
          sdgContributions: sdgTags.length,
        };
      })
      .sort(
        (a, b) =>
          b.projectCount - a.projectCount ||
          a.barangay.localeCompare(b.barangay)
      );

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve barangay contributions.");
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    if (!canManageProject(req, project)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this project.",
      });
    }

    return res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve project.");
  }
});

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({
      publicationStatus: "Published",
      reviewStatus: "Approved",
    })
      .sort({ publishedAt: -1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    return sendError(res, error, "Failed to retrieve published projects.");
  }
});

module.exports = router;
