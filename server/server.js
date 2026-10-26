
require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const knowledgeRoutes = require("./routes/KnowledgeRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const eventRoutes = require("./routes/eventRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const activityRoutes = require("./routes/activityRoutes");
const completionReportRoutes = require("./routes/completionReportRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

// Ensure upload directories exist.
const uploadsRoot = path.join(__dirname, "uploads");

fs.mkdirSync(path.join(uploadsRoot, "knowledge"), {
  recursive: true,
});

fs.mkdirSync(path.join(uploadsRoot, "projects"), {
  recursive: true,
});

// Serve images and documents from:
// /uploads/knowledge/filename.png
// /uploads/projects/filename.png
app.use("/uploads", express.static(uploadsRoot));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// API routes
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/completion-reports", completionReportRoutes);

app.get("/", (req, res) => {
  res.send("SDG Smart Hub Backend Running");
});

// Helpful upload diagnostic endpoint.
app.get("/api/health/uploads", (req, res) => {
  const knowledgeDir = path.join(uploadsRoot, "knowledge");
  const projectsDir = path.join(uploadsRoot, "projects");

  res.json({
    success: true,
    uploadsRoot,
    knowledgeDirectoryExists: fs.existsSync(knowledgeDir),
    projectsDirectoryExists: fs.existsSync(projectsDir),
    knowledgeFileCount: fs.existsSync(knowledgeDir)
      ? fs.readdirSync(knowledgeDir).length
      : 0,
    projectFileCount: fs.existsSync(projectsDir)
      ? fs.readdirSync(projectsDir).length
      : 0,
  });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error("MONGODB_URI is missing from your environment.");
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("MongoDB Atlas Connected");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  }
}

startServer();