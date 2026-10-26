
const Project = require("../models/Project");
const Event = require("../models/Event");
const User = require("../models/User");

const SDG_LIST = [
  { tag: "SDG 1", label: "No Poverty", color: "#E5243B" },
  { tag: "SDG 2", label: "Zero Hunger", color: "#DDA63A" },
  { tag: "SDG 3", label: "Good Health and Well-being", color: "#4C9F38" },
  { tag: "SDG 4", label: "Quality Education", color: "#C5192D" },
  { tag: "SDG 5", label: "Gender Equality", color: "#FF3A21" },
  { tag: "SDG 6", label: "Clean Water and Sanitation", color: "#26BDE2" },
  { tag: "SDG 7", label: "Affordable and Clean Energy", color: "#FCC30B" },
  { tag: "SDG 8", label: "Decent Work and Economic Growth", color: "#A21942" },
  { tag: "SDG 9", label: "Industry, Innovation and Infrastructure", color: "#FD6925" },
  { tag: "SDG 10", label: "Reduced Inequalities", color: "#DD1367" },
  { tag: "SDG 11", label: "Sustainable Cities and Communities", color: "#FD9D24" },
  { tag: "SDG 12", label: "Responsible Consumption and Production", color: "#BF8B2E" },
  { tag: "SDG 13", label: "Climate Action", color: "#3F7E44" },
  { tag: "SDG 14", label: "Life Below Water", color: "#0A97D9" },
  { tag: "SDG 15", label: "Life on Land", color: "#56C02B" },
  { tag: "SDG 16", label: "Peace, Justice and Strong Institutions", color: "#00689D" },
  { tag: "SDG 17", label: "Partnerships for the Goals", color: "#19486A" },
];

const VALID_RANGES = [
  "weekly",
  "monthly",
  "quarterly",
  "1month",
  "3months",
  "6months",
  "1year",
  "all",
];

const VALID_METRICS = ["projects", "users", "events"];

function getBarangay(req) {
  if (req.user?.role === "admin") {
    return null;
  }

  const barangay = req.user?.barangay?.trim();

  if (!barangay) {
    const error = new Error(
      "Your account does not have a registered barangay."
    );
    error.status = 403;
    throw error;
  }

  return barangay;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getProjectScope(req) {
  const barangay = getBarangay(req);

  if (barangay === null) {
    return {};
  }

  return {
    barangay: {
      $regex: `^${escapeRegex(barangay)}$`,
      $options: "i",
    },
  };
}

function getScopedUserMatch(req) {
  const barangay = getBarangay(req);

  if (barangay === null) {
    return {};
  }

  return {
    barangay: {
      $regex: `^${escapeRegex(barangay)}$`,
      $options: "i",
    },
  };
}

function getEventScope(req) {
  const barangay = getBarangay(req);

  if (barangay === null) {
    return {};
  }

  return {
    $or: [
      {
        barangay: {
          $regex: `^${escapeRegex(barangay)}$`,
          $options: "i",
        },
      },
      {
        barangay: {
          $regex: "^All Barangays$",
          $options: "i",
        },
      },
    ],
  };
}

function buildDateFilter(year, range, field = "createdAt") {
  const filter = {};

  if (year !== undefined && year !== "") {
    const parsedYear = Number(year);

    if (
      !Number.isInteger(parsedYear) ||
      parsedYear < 2000 ||
      parsedYear > 2100
    ) {
      const error = new Error("Invalid year.");
      error.status = 400;
      throw error;
    }

    filter[field] = {
      $gte: new Date(parsedYear, 0, 1),
      $lt: new Date(parsedYear + 1, 0, 1),
    };

    return filter;
  }

  const selectedRange = range || "all";

  if (!VALID_RANGES.includes(selectedRange)) {
    const error = new Error("Invalid analytics period.");
    error.status = 400;
    throw error;
  }

  if (selectedRange === "all") {
    return filter;
  }

  const now = new Date();
  const start = new Date(now);

  switch (selectedRange) {
    case "weekly":
      start.setDate(start.getDate() - 7);
      break;
    case "monthly":
    case "1month":
      start.setMonth(start.getMonth() - 1);
      break;
    case "quarterly":
    case "3months":
      start.setMonth(start.getMonth() - 3);
      break;
    case "6months":
      start.setMonth(start.getMonth() - 6);
      break;
    case "1year":
      start.setFullYear(start.getFullYear() - 1);
      break;
    default:
      break;
  }

  filter[field] = {
    $gte: start,
    $lte: now,
  };

  return filter;
}

function getProjectSDGTags() {
  return {
    $set: {
      normalizedSDGs: {
        $let: {
          vars: {
            rawTags: {
              $cond: [
                { $isArray: "$sdgTags" },
                "$sdgTags",
                {
                  $cond: [
                    {
                      $and: [
                        { $ne: ["$sdgTag", null] },
                        { $ne: ["$sdgTag", ""] },
                      ],
                    },
                    ["$sdgTag"],
                    [],
                  ],
                },
              ],
            },
          },
          in: {
            $setUnion: [
              {
                $map: {
                  input: "$$rawTags",
                  as: "tag",
                  in: {
                    $toUpper: {
                      $trim: {
                        input: { $toString: "$$tag" },
                      },
                    },
                  },
                },
              },
              [],
            ],
          },
        },
      },
    },
  };
}

function getPublishedProjectMatch(req) {
  return {
    ...getProjectScope(req),
    publicationStatus: "Published",
  };
}

function sendAnalyticsError(res, error, operation) {
  console.error(`${operation} error:`, error);

  const status = error.status || 500;

  return res.status(status).json({
    success: false,
    message:
      status === 500
        ? "Unable to load analytics data."
        : error.message,
  });
}

async function getSDGProjectDistribution(req, res) {
  try {
    const dateFilter = buildDateFilter(
      req.query.year,
      req.query.range || "all",
      "createdAt"
    );

    const match = {
      ...getPublishedProjectMatch(req),
      ...dateFilter,
    };

    const results = await Project.aggregate([
      { $match: match },
      getProjectSDGTags(),
      { $unwind: "$normalizedSDGs" },
      {
        $match: {
          normalizedSDGs: {
            $in: SDG_LIST.map((sdg) => sdg.tag),
          },
        },
      },
      {
        $group: {
          _id: "$normalizedSDGs",
          count: { $sum: 1 },
        },
      },
    ]);

    const countMap = new Map(
      results.map((item) => [item._id, item.count])
    );

    const data = SDG_LIST.map((sdg) => ({
      tag: sdg.tag,
      label: sdg.label,
      color: sdg.color,
      count: countMap.get(sdg.tag) || 0,
    }));

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return sendAnalyticsError(
      res,
      error,
      "getSDGProjectDistribution"
    );
  }
}

async function getSDGParticipation(req, res) {
  try {
    const dateFilter = buildDateFilter(
      req.query.year,
      req.query.range || "all",
      "createdAt"
    );

    const requestedLimit = Number(req.query.limit || 3);

    if (
      !Number.isInteger(requestedLimit) ||
      requestedLimit < 1 ||
      requestedLimit > 17
    ) {
      return res.status(400).json({
        success: false,
        message: "The participation limit must be between 1 and 17.",
      });
    }

    const match = {
      ...getPublishedProjectMatch(req),
      ...dateFilter,
    };

    const results = await Project.aggregate([
      { $match: match },
      getProjectSDGTags(),
      { $unwind: "$normalizedSDGs" },
      {
        $match: {
          normalizedSDGs: {
            $in: SDG_LIST.map((sdg) => sdg.tag),
          },
        },
      },
      {
        $group: {
          _id: "$normalizedSDGs",
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          count: -1,
          _id: 1,
        },
      },
      { $limit: requestedLimit },
    ]);

    const sdgMap = new Map(
      SDG_LIST.map((sdg) => [sdg.tag, sdg])
    );

    const data = results.map((item) => {
      const sdg = sdgMap.get(item._id);

      return {
        tag: item._id,
        label: sdg?.label || item._id,
        color: sdg?.color || "#64748b",
        count: item.count,
      };
    });

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return sendAnalyticsError(
      res,
      error,
      "getSDGParticipation"
    );
  }
}

async function getSDGTrend(req, res) {
  try {
    const metric = req.query.metric || "projects";
    const range = req.query.range || "monthly";

    if (!VALID_METRICS.includes(metric)) {
      return res.status(400).json({
        success: false,
        message: "Invalid trend metric.",
      });
    }

    const dateFilter = buildDateFilter(
      req.query.year,
      range,
      metric === "events" ? "date" : "createdAt"
    );

    let Model;
    let match;

    if (metric === "projects") {
      Model = Project;
      match = {
        ...getPublishedProjectMatch(req),
        ...dateFilter,
      };
    } else if (metric === "users") {
      Model = User;
      match = {
        ...getScopedUserMatch(req),
        ...dateFilter,
      };
    } else {
      Model = Event;
      match = {
        ...getEventScope(req),
        ...dateFilter,
      };
    }

    const data = await Model.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: {
              $year: metric === "events" ? "$date" : "$createdAt",
            },
            month: {
              $month: metric === "events" ? "$date" : "$createdAt",
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          label: {
            $concat: [
              {
                $arrayElemAt: [
                  [
                    "",
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct",
                    "Nov",
                    "Dec",
                  ],
                  "$_id.month",
                ],
              },
              " ",
              { $toString: "$_id.year" },
            ],
          },
          count: 1,
        },
      },
    ]);

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    return sendAnalyticsError(res, error, "getSDGTrend");
  }
}

async function getDashboardSummary(req, res) {
  try {
    const barangay = getBarangay(req);

    const publishedMatch = {
      ...getPublishedProjectMatch(req),
    };

    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const nextYearStart = new Date(
      new Date().getFullYear() + 1,
      0,
      1
    );

    const thisYearMatch = {
      ...publishedMatch,
      createdAt: {
        $gte: yearStart,
        $lt: nextYearStart,
      },
    };

    const eventMatch = getEventScope(req);

    const [
      totalProjects,
      thisYear,
      activeGoalsResult,
      communitiesResult,
      totalEvents,
    ] = await Promise.all([
      Project.countDocuments(publishedMatch),
      Project.countDocuments(thisYearMatch),
      Project.aggregate([
        { $match: publishedMatch },
        getProjectSDGTags(),
        { $unwind: "$normalizedSDGs" },
        {
          $match: {
            normalizedSDGs: {
              $in: SDG_LIST.map((sdg) => sdg.tag),
            },
          },
        },
        {
          $group: {
            _id: "$normalizedSDGs",
          },
        },
        { $count: "count" },
      ]),
      Project.distinct("barangay", publishedMatch),
      Event.countDocuments(eventMatch),
    ]);

    return res.json({
      success: true,
      data: {
        totalProjects,
        activeGoals: activeGoalsResult[0]?.count || 0,
        communities: communitiesResult.filter(Boolean).length,
        thisYear,
        totalEvents,
        barangay: barangay || "All Barangays",
      },
    });
  } catch (error) {
    return sendAnalyticsError(
      res,
      error,
      "getDashboardSummary"
    );
  }
}

async function getStats(req, res) {
  try {
    const [
      totalUsers,
      totalProjects,
      publishedProjects,
      totalEvents,
      pendingUsers,
    ] = await Promise.all([
      User.countDocuments({}),
      Project.countDocuments({}),
      Project.countDocuments({
        publicationStatus: "Published",
      }),
      Event.countDocuments({}),
      User.countDocuments({
        accountStatus: "Pending",
      }),
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalProjects,
        publishedProjects,
        totalEvents,
        pendingUsers,
      },
    });
  } catch (error) {
    return sendAnalyticsError(res, error, "getStats");
  }
}

module.exports = {
  getSDGProjectDistribution,
  getSDGParticipation,
  getSDGTrend,
  getDashboardSummary,
  getStats,
};
