const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const Project = require("../models/Project");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const {
  logActivity,
} = require("../utils/activityLogger");

const uploadDir = path.join(
  __dirname,
  "../uploads/projects"
);

fs.mkdirSync(uploadDir, {
  recursive: true,
});

const storage = multer.diskStorage({
  destination: (
    req,
    file,
    callback
  ) => {
    callback(null, uploadDir);
  },

  filename: (
    req,
    file,
    callback
  ) => {
    const extension =
      path.extname(
        file.originalname
      ).toLowerCase();

    const filename =
      `project-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    callback(
      null,
      filename
    );
  },
});

const upload = multer({
  storage,

  limits: {
    files: 10,
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (
      allowedTypes.includes(
        file.mimetype
      )
    ) {
      callback(null, true);
      return;
    }

    callback(
      new Error(
        "Only JPG, PNG, and WebP images are allowed."
      )
    );
  },
});

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

  if (typeof fields.sdgTags === "string") {
    try {
      fields.sdgTags =
        JSON.parse(fields.sdgTags);
    } catch {
      fields.sdgTags = [];
    }
  }

  if (typeof fields.tags === "string") {
    try {
      fields.tags =
        JSON.parse(fields.tags);
    } catch {
      fields.tags = [];
    }
  }

  if (
    typeof fields.featured === "string"
  ) {
    fields.featured =
      fields.featured === "true";
  }

  return fields;
}

function getPhotoPaths(files) {
  return files.map(
    (file) =>
      `/uploads/projects/${file.filename}`
  );
}

function removePhotoFile(photoPath) {
  if (!photoPath) {
    return;
  }

  const filename =
    path.basename(photoPath);

  const filePath =
    path.join(
      uploadDir,
      filename
    );

  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

router.get(
  "/admin/all",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const projects =
        await Project.find().sort({
          updatedAt: -1,
        });

      res.json({
        success: true,
        data: projects,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message:
          "Failed to retrieve projects.",
      });
    }
  }
);

router.post(
  "/",
  auth,
  adminOnly,
  upload.array("photos", 10),
  async (req, res) => {
    try {
      const fields =
        getEditableFields(
          req.body
        );

      const photos =
        getPhotoPaths(
          req.files || []
        );

      const project =
        await Project.create({
          ...fields,
          photos,
          publicationStatus:
            "Draft",
          publishedAt: null,
          createdBy:
            req.user.id,
        });

      await logActivity({
        actor: req.user.id,
        action: "created",
        entityType: "project",
        entityId: project._id,
        entityTitle: project.title,
        details:
          "Created a new project draft.",
      });

      res.status(201).json({
        success: true,
        message:
          "Project saved as a draft.",
        data: project,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message:
          err.message ||
          "Failed to create project.",
      });
    }
  }
);

router.patch(
  "/:id/featured",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const project =
        await Project.findById(
          req.params.id
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found.",
        });
      }

      project.featured =
        Boolean(req.body.featured);

      await project.save();

      await logActivity({
        actor: req.user.id,
        action: "updated",
        entityType: "project",
        entityId: project._id,
        entityTitle: project.title,
        details:
          project.featured
            ? "Added project to showcase."
            : "Removed project from showcase.",
      });

      res.json({
        success: true,
        message:
          project.featured
            ? "Project added to showcase."
            : "Project removed from showcase.",
        data: project,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message:
          err.message ||
          "Failed to update showcase status.",
      });
    }
  }
);

router.put(
  "/:id",
  auth,
  adminOnly,
  upload.array("photos", 10),
  async (req, res) => {
    try {
      const project =
        await Project.findById(
          req.params.id
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found.",
        });
      }

      const fields =
        getEditableFields(
          req.body
        );

      let existingPhotos = [];

      if (
        req.body.existingPhotos
      ) {
        try {
          existingPhotos =
            JSON.parse(
              req.body.existingPhotos
            );
        } catch {
          existingPhotos = [];
        }
      }

      const uploadedPhotos =
        getPhotoPaths(
          req.files || []
        );

      const oldPhotos =
        project.photos || [];

      const removedPhotos =
        oldPhotos.filter(
          (photo) =>
            !existingPhotos.includes(
              photo
            )
        );

      removedPhotos.forEach(
        removePhotoFile
      );

      fields.photos = [
        ...existingPhotos,
        ...uploadedPhotos,
      ];

      Object.assign(
        project,
        fields
      );

      await project.save();

      await logActivity({
        actor: req.user.id,
        action: "updated",
        entityType: "project",
        entityId: project._id,
        entityTitle: project.title,
        details:
          "Updated project details.",
      });

      res.json({
        success: true,
        message:
          "Project details updated.",
        data: project,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message:
          err.message ||
          "Failed to update project.",
      });
    }
  }
);

router.patch(
  "/:id/publish",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const project =
        await Project.findById(
          req.params.id
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found.",
        });
      }

      const requiredFields = [
        "title",
        "description",
        "sdgTag",
        "barangay",
      ];

      const missingFields =
        requiredFields.filter(
          (field) =>
            typeof project[field] !==
              "string" ||
            project[field]
              .trim()
              .length === 0
        );

      if (
        missingFields.length > 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Complete the required project details before publishing.",
          missingFields,
        });
      }

      project.publicationStatus =
        "Published";

      project.publishedAt =
        new Date();

      await project.save();

      await logActivity({
        actor: req.user.id,
        action: "published",
        entityType: "project",
        entityId: project._id,
        entityTitle: project.title,
        details:
          "Published a project.",
      });

      res.json({
        success: true,
        message:
          "Project published successfully.",
        data: project,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message:
          err.message ||
          "Failed to publish project.",
      });
    }
  }
);

router.patch(
  "/:id/unpublish",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const project =
        await Project.findById(
          req.params.id
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found.",
        });
      }

      project.publicationStatus =
        "Draft";

      project.publishedAt = null;

      await project.save();

      await logActivity({
        actor: req.user.id,
        action: "unpublished",
        entityType: "project",
        entityId: project._id,
        entityTitle: project.title,
        details:
          "Returned a project to draft status.",
      });

      res.json({
        success: true,
        message:
          "Project returned to draft status.",
        data: project,
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message:
          err.message ||
          "Failed to unpublish project.",
      });
    }
  }
);

router.delete(
  "/:id",
  auth,
  adminOnly,
  async (req, res) => {
    try {
      const project =
        await Project.findByIdAndDelete(
          req.params.id
        );

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Project not found.",
        });
      }

      project.photos?.forEach(
        removePhotoFile
      );

      await logActivity({
        actor: req.user.id,
        action: "deleted",
        entityType: "project",
        entityId: project._id,
        entityTitle: project.title,
        details:
          "Deleted a project.",
      });

      res.json({
        success: true,
        message:
          "Project deleted successfully.",
      });
    } catch (err) {
      res.status(400).json({
        success: false,
        message:
          err.message ||
          "Failed to delete project.",
      });
    }
  }
);

router.get(
  "/",
  async (req, res) => {
    try {
      const projects =
        await Project.find({
          publicationStatus:
            "Published",
        }).sort({
          publishedAt: -1,
          createdAt: -1,
        });

      res.json({
        success: true,
        data: projects,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message:
          "Failed to retrieve published projects.",
      });
    }
  }
);

router.get(
  "/:id",
  async (req, res) => {
    try {
      const project =
        await Project.findOne({
          _id: req.params.id,
          publicationStatus:
            "Published",
        });

      if (!project) {
        return res.status(404).json({
          success: false,
          message:
            "Published project not found.",
        });
      }

      res.json({
        success: true,
        data: project,
      });
    } catch (err) {
      if (
        err.name ===
        "CastError"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid project ID.",
        });
      }

      res.status(500).json({
        success: false,
        message:
          "Failed to retrieve project.",
      });
    }
  }
);

module.exports = router;