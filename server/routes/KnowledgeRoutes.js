const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

const KnowledgeArticle = require("../models/KnowledgeArticle");

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const uploadDir = path.join(
  __dirname,
  "../uploads/knowledge"
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
      `knowledge-${Date.now()}-${Math.round(
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

function getPhotoPaths(files) {
  return files.map(
    (file) =>
      `/uploads/knowledge/${file.filename}`
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

router.get("/", async (req, res) => {
  try {
    const articles =
      await KnowledgeArticle.find()
        .sort({
          createdAt: -1,
        });

    res.json({
      success: true,
      data: articles,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const article =
      await KnowledgeArticle.findById(
        req.params.id
      );

    if (!article) {
      return res.status(404).json({
        success: false,
        message: "Article not found",
      });
    }

    res.json({
      success: true,
      data: article,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.post(
  "/",
  auth,
  adminOnly,
  upload.array("photos", 10),
  async (req, res) => {
    try {
      const photos =
        getPhotoPaths(
          req.files || []
        );

      const article =
        await KnowledgeArticle.create({
          ...req.body,
          photos,
          createdBy: req.user.id,
        });

      res.status(201).json({
        success: true,
        data: article,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
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
      const article =
        await KnowledgeArticle.findById(
          req.params.id
        );

      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }

      const oldPhotos =
        article.photos || [];

      let existingPhotos = [];

      if (req.body.existingPhotos) {
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

      article.title =
        req.body.title;

      article.summary =
        req.body.summary;

      article.content =
        req.body.content;

      article.sdgTag =
        req.body.sdgTag;

      article.category =
        req.body.category;

      article.readTime =
        req.body.readTime;

      article.photos = [
        ...existingPhotos,
        ...uploadedPhotos,
      ];

      await article.save();

      res.json({
        success: true,
        data: article,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
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
      const article =
        await KnowledgeArticle.findByIdAndDelete(
          req.params.id
        );

      if (!article) {
        return res.status(404).json({
          success: false,
          message: "Article not found",
        });
      }

      article.photos?.forEach(
        removePhotoFile
      );

      res.json({
        success: true,
        message: "Article deleted",
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

module.exports = router;