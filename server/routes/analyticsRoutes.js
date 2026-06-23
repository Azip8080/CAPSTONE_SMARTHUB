const express = require("express");
const router = express.Router();
const {
  getSDGProjectDistribution,
  getSDGParticipation,
  getSDGTrend,
} = require("../controllers/analyticsController");

// GET /api/analytics/distribution?year=2024&range=6months
router.get("/distribution", getSDGProjectDistribution);

// GET /api/analytics/participation?year=2024&range=6months
router.get("/participation", getSDGParticipation);

// GET /api/analytics/trend?metric=projects&range=6months
router.get("/trend", getSDGTrend);

module.exports = router;
