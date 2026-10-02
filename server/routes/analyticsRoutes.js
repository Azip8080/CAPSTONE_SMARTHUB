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

router.get(
  "/distribution",
  getSDGProjectDistribution
);

router.get(
  "/participation",
  getSDGParticipation
);

router.get(
  "/trend",
  getSDGTrend
);

router.get(
  "/dashboard-summary",
  getDashboardSummary
);

router.get(
  "/stats",
  auth,
  adminOnly,
  getStats
);

module.exports = router;