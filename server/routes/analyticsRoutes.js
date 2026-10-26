
const express = require("express");
const router = express.Router();

const {
  getSDGProjectDistribution,
  getSDGParticipation,
  getSDGTrend,
  getDashboardSummary,
  getStats,
} = require("../controllers/analyticsController");

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/distribution", auth, getSDGProjectDistribution);
router.get("/participation", auth, getSDGParticipation);
router.get("/trend", auth, getSDGTrend);
router.get("/dashboard-summary", auth, getDashboardSummary);

router.get("/stats", auth, adminOnly, getStats);

module.exports = router;
