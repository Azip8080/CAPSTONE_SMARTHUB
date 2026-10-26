
const express = require("express");
const router = express.Router();

const Activity = require("../models/Activity");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const activities = await Activity.find()
      .populate("actor", "fullName email role")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    return res.status(200).json({
      success: true,
      data: activities,
    });
  } catch (err) {
    console.error("Retrieve activities error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve activities.",
    });
  }
});

module.exports = router;
