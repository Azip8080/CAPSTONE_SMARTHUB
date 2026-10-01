const express = require("express");

const router = express.Router();

const Project = require("../models/Project");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const editableFields = [
  "title",
  "description",
  "sdgTag",
  "barangay",
  "status",
];

function getEditableFields(body) {
  const fields = {};

  for (const field of editableFields) {
    if (body[field] !== undefined) {
      fields[field] = body[field];
    }
  }

  return fields;
}
router.get("/admin/all", auth, adminOnly, async (req, res) => {
  try {
    const projects = await Project.find().sort({ updatedAt: -1 });

    res.json({
      success: true,
      data: projects,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve projects.",
    });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {
  try {
    const fields = getEditableFields(req.body);

    const project = await Project.create({
      ...fields,
      publicationStatus: "Draft",
      publishedAt: null,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Project saved as a draft.",
      data: project,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to create project.",
    });
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  try {
    const fields = getEditableFields(req.body);

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: fields },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.json({
      success: true,
      message: "Project details updated.",
      data: project,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to update project.",
    });
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

    const requiredFields = [
      "title",
      "description",
      "sdgTag",
      "barangay",
    ];

    const missingFields = requiredFields.filter(
      (field) =>
        typeof project[field] !== "string" ||
        project[field].trim().length === 0
    );

    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Complete the required project details before publishing.",
        missingFields,
      });
    }

    project.publicationStatus = "Published";
    project.publishedAt = new Date();

    await project.save();

    res.json({
      success: true,
      message: "Project published successfully.",
      data: project,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to publish project.",
    });
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

    res.json({
      success: true,
      message: "Project returned to draft status.",
      data: project,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to unpublish project.",
    });
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message || "Failed to delete project.",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const projects = await Project.find({
      publicationStatus: "Published",
    }).sort({ publishedAt: -1, createdAt: -1 });

    res.json({
      success: true,
      data: projects,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve published projects.",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      publicationStatus: "Published",
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Published project not found.",
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (err) {
    if (err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to retrieve project.",
    });
  }
});

module.exports = router;