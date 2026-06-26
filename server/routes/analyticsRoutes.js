const express = require("express");
const router = express.Router();
const {
  getSDGProjectDistribution,
  getSDGParticipation,
  getSDGTrend,
  getDashboardSummary,
} = require("../controllers/analyticsController");

router.get("/distribution", getSDGProjectDistribution);
router.get("/participation", getSDGParticipation);
router.get("/trend", getSDGTrend);
router.get("/summary", getDashboardSummary);
module.exports = router;
