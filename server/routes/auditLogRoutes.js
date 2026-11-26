
const express = require("express");
const router = express.Router();

const AuditLog = require("../models/AuditLog");
const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(
      100,
      Math.max(1, parseInt(req.query.limit, 10) || 20)
    );

    const {
      search,
      action,
      role,
      from,
      to,
    } = req.query;

    const filter = {};

    if (search && search.trim()) {
      const searchRegex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i"
      );

      filter.$or = [
        { userName: searchRegex },
        { userEmail: searchRegex },
        { description: searchRegex },
        { remarks: searchRegex },
      ];
    }

    if (action && action !== "all") {
      filter.action = action;
    }

    if (role && role !== "all") {
      filter.userRole = role;
    }

    if (from || to) {
      filter.createdAt = {};

      if (from) {
        const fromDate = new Date(`${from}T00:00:00.000Z`);

        if (Number.isNaN(fromDate.getTime())) {
          return res.status(400).json({
            message: "Invalid start date.",
          });
        }

        filter.createdAt.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(`${to}T23:59:59.999Z`);

        if (Number.isNaN(toDate.getTime())) {
          return res.status(400).json({
            message: "Invalid end date.",
          });
        }

        filter.createdAt.$lte = toDate;
      }
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),

      AuditLog.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      logs,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET AUDIT LOGS ERROR]", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve audit logs.",
    });
  }
});

module.exports = router;
