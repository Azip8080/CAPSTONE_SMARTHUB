
require("dotenv").config({
  path: require("path").join(__dirname, ".env"),
});

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

console.log(
  "CLIENT_URL configured:",
  Boolean(process.env.CLIENT_URL?.trim())
);
console.log(
  "BREVO_API_KEY configured:",
  Boolean(process.env.BREVO_API_KEY?.trim())
);
console.log(
  "BREVO_SENDER_EMAIL configured:",
  Boolean(process.env.BREVO_SENDER_EMAIL?.trim())
);

const knowledgeRoutes = require("./routes/KnowledgeRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const eventRoutes = require("./routes/eventRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const aiRoutes = require("./routes/aiRoutes");
const activityRoutes = require("./routes/activityRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);


app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/activity", activityRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("SDG Smart Hub Backend Running");
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
