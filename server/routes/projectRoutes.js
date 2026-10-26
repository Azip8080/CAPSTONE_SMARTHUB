
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const Project = require("../models/Project");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");
const { logActivity } = require("../utils/activityLogger");

const uploadDir = path.join(__dirname, "../uploads/projects");

fs.mkdirSync(uploadDir, { recursive: true });

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

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

    callback(
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
  return files.map(
    (file) => `/uploads/projects/${file.filename}`
  );
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

    const status =
      error.code === "LIMIT_FILE_SIZE" ? 413 : 400;

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

// GET ALL PROJECTS FOR ADMIN
router.get("/admin/all", auth, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find().sort({ updatedAt: -1 });

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Admin projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve projects.",
    });
  }
});

// CREATE PROJECT DRAFT
router.post(
  "/",
  auth,
  adminOnly,
  handleUploadError,
  async (req, res) => {
    try {
      const fields = getEditableFields(req.body);
      const photos = getPhotoPaths(req.files?.photos || []);
      const document = getUploadedDocument(req);

      const project = await Project.create({
        ...fields,
        photos,
        document: document || undefined,
        publicationStatus: "Draft",
        publishedAt: null,
        createdBy: req.user.id,
      });

      await logActivity({
        actor: req.user.id,
        action: "created",
        entityType: "Project",
        entityId: project._id,
        entityTitle: project.title,
        details: "Created a new project draft.",
      });

      return res.status(201).json({
        success: true,
        message: "Project saved as a draft.",
        data: project,
      });
    } catch (error) {
      removeUploadedFiles(req.files);
      console.error("Create project error:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to create project.",
      });
    }
  }
);

// UPDATE FEATURED STATUS
router.patch("/:id/featured", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    project.featured =
      req.body.featured === true ||
      req.body.featured === "true";

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

    return res.json({
      success: true,
      message: project.featured
        ? "Project added to showcase."
        : "Project removed from showcase.",
      data: project,
    });
  } catch (error) {
    console.error("Feature project error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to update showcase status.",
    });
  }
});

// EDIT PROJECT
router.put(
  "/:id",
  auth,
  adminOnly,
  handleUploadError,
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        removeUploadedFiles(req.files);

        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      const fields = getEditableFields(req.body);
      const oldPhotos = project.photos || [];

      const existingPhotos = parseExistingPhotos(
        req.body.existingPhotos,
        oldPhotos
      );

      const validExistingPhotos = existingPhotos.filter(
        (photo) =>
          typeof photo === "string" &&
          oldPhotos.includes(photo)
      );

      const uploadedPhotos = getPhotoPaths(
        req.files?.photos || []
      );

      const removedPhotos = oldPhotos.filter(
        (photo) => !validExistingPhotos.includes(photo)
      );

      fields.photos = [
        ...validExistingPhotos,
        ...uploadedPhotos,
      ];

      const previousDocumentPath = project.document?.path;
      const newDocument = getUploadedDocument(req);

      if (newDocument) {
        fields.document = newDocument;
      }

      Object.assign(project, fields);

      await project.save();

      removedPhotos.forEach(removeProjectFile);

      if (newDocument && previousDocumentPath) {
        removeProjectFile(previousDocumentPath);
      }

      await logActivity({
        actor: req.user.id,
        action: "updated",
        entityType: "Project",
        entityId: project._id,
        entityTitle: project.title,
        details: "Updated project details.",
      });

      return res.json({
        success: true,
        message: "Project details updated.",
        data: project,
      });
    } catch (error) {
      removeUploadedFiles(req.files);
      console.error("Update project error:", error);

      return res.status(400).json({
        success: false,
        message: error.message || "Failed to update project.",
      });
    }
  }
);

// PUBLISH PROJECT
router.patch("/:id/publish", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
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
        message: "Complete the required project details before publishing.",
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

    return res.json({
      success: true,
      message: "Project published successfully.",
      data: project,
    });
  } catch (error) {
    console.error("Publish project error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to publish project.",
    });
  }
});

// UNPUBLISH PROJECT
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

    return res.json({
      success: true,
      message: "Project returned to draft status.",
      data: project,
    });
  } catch (error) {
    console.error("Unpublish project error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to unpublish project.",
    });
  }
});

// DELETE PROJECT
router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

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

    return res.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to delete project.",
    });
  }
});

// GET ALL PUBLISHED PROJECTS
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({
      publicationStatus: "Published",
    }).sort({
      publishedAt: -1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Published projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve published projects.",
    });
  }
});

// GET PUBLISHED PROJECTS FOR A SPECIFIC BARANGAY
router.get("/barangay/:barangay/published", async (req, res) => {
  try {
    const barangay = String(req.params.barangay || "").trim();

    if (!barangay) {
      return res.status(400).json({
        success: false,
        message: "Barangay name is required.",
      });
    }

    const escapedBarangay = barangay.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const projects = await Project.find({
      publicationStatus: "Published",
      barangay: {
        $regex: `^${escapedBarangay}$`,
        $options: "i",
      },
    }).sort({
      publishedAt: -1,
      createdAt: -1,
    });

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error("Published barangay projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve published projects for this barangay.",
    });
  }
});

// GET BARANGAY PROJECT RANKING
router.get("/barangay-ranking", async (req, res) => {
  try {
    const projects = await Project.find({
      publicationStatus: "Published",
      barangay: {
        $exists: true,
        $nin: ["", null],
      },
    })
      .select("barangay sdgTag sdgTags")
      .lean();

    const barangays = new Map();

    function normalizeSdg(value) {
      if (typeof value === "string") return value.trim();

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
        const sdgTags = [...entry.sdgTags].sort(
          (a, b) =>
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
    console.error("Barangay contribution error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve barangay contributions.",
    });
  }
});

module.exports = router;