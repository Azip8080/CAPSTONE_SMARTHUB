const Project = require("../models/Project");
const Event = require("../models/Event");
const User = require("../models/User");

const SDG_LIST = [
  { tag: "SDG 1",  label: "No Poverty",               color: "#E5243B" },
  { tag: "SDG 2",  label: "Zero Hunger",               color: "#DDA63A" },
  { tag: "SDG 3",  label: "Good Health",               color: "#4C9F38" },
  { tag: "SDG 4",  label: "Quality Education",         color: "#C5192D" },
  { tag: "SDG 5",  label: "Gender Equality",           color: "#FF3A21" },
  { tag: "SDG 6",  label: "Clean Water",               color: "#26BDE2" },
  { tag: "SDG 7",  label: "Clean Energy",              color: "#FCC30B" },
  { tag: "SDG 8",  label: "Decent Work",               color: "#A21942" },
  { tag: "SDG 9",  label: "Industry & Innovation",     color: "#FD6925" },
  { tag: "SDG 10", label: "Reduced Inequalities",      color: "#DD1367" },
  { tag: "SDG 11", label: "Sustainable Cities",        color: "#FD9D24" },
  { tag: "SDG 12", label: "Responsible Consumption",   color: "#BF8B2E" },
  { tag: "SDG 13", label: "Climate Action",            color: "#3F7E44" },
  { tag: "SDG 14", label: "Life Below Water",          color: "#0A97D9" },
  { tag: "SDG 15", label: "Life on Land",              color: "#56C02B" },
  { tag: "SDG 16", label: "Peace & Justice",           color: "#00689D" },
  { tag: "SDG 17", label: "Partnerships",              color: "#19486A" },
];


function buildDateFilter(year, range, field = "createdAt") {
  if (year) {
    return {
      [field]: {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`),
      },
    };
  }
  if (range && range !== "all") {
    const monthsMap = { "1month": 1, "3months": 3, "6months": 6, "1year": 12 };
    const months = monthsMap[range];
    if (months) {
      const from = new Date();
      from.setMonth(from.getMonth() - months);
      return { [field]: { $gte: from } };
    }
  }
  return {};
}


const getSDGProjectDistribution = async (req, res) => {
  try {
    const { year, range } = req.query;
    const dateFilter = buildDateFilter(year, range);

    const results = await Project.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$sdgTag", count: { $sum: 1 } } },
    ]);
    const data = SDG_LIST.map((sdg) => {
      const found = results.find((r) => r._id === sdg.tag);
      return {
        tag: sdg.tag,
        label: sdg.label,
        color: sdg.color,
        count: found ? found.count : 0,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("getSDGProjectDistribution:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const getSDGParticipation = async (req, res) => {
  try {
    const { year, range } = req.query;
    const dateFilter = buildDateFilter(year, range);

    const results = await Project.aggregate([
      { $match: dateFilter },
      { $group: { _id: "$sdgTag", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 3 },
    ]);

    const data = results.map((r) => {
      const sdg = SDG_LIST.find((s) => s.tag === r._id) || {};
      return {
        tag: r._id,
        label: sdg.label || r._id,
        color: sdg.color || "#888",
        count: r.count,
      };
    });

    res.json({ success: true, data });
  } catch (err) {
    console.error("getSDGParticipation:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getSDGTrend = async (req, res) => {
  try {
    const { metric = "projects", range = "6months" } = req.query;

    const modelMap = {
      projects:  { model: Project, dateField: "createdAt" },
      users:     { model: User,    dateField: "createdAt" },
      events:    { model: Event,   dateField: "date" },
    };

    const entry = modelMap[metric];
    if (!entry) {
      return res.status(400).json({ success: false, message: "Invalid metric. Use: projects, users, events" });
    }

    const dateFilter = buildDateFilter(null, range, entry.dateField);

    const results = await entry.model.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: {
            year:  { $year:  `$${entry.dateField}` },
            month: { $month: `$${entry.dateField}` },
          },
          total: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const data = results.map((r) => ({
      label: new Date(r._id.year, r._id.month - 1).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      }),
      total: r.total,
    }));

    res.json({ success: true, metric, data });
  } catch (err) {
    console.error("getSDGTrend:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const getDashboardSummary = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const totalProjects = await Project.countDocuments();
    const activeGoals = await Project.distinct("sdgTag");
    const communities = await Project.distinct("barangay");
    const projectsThisYear = await Project.countDocuments({
      createdAt: {
        $gte: new Date(`${currentYear}-01-01`),
        $lte: new Date(`${currentYear}-12-31`),
      },
    });

    res.json({
      success: true,
      data: {
        totalProjects,
        activeGoals: activeGoals.length,
        communities: communities.length,
        thisYear: projectsThisYear,
      },
    });
  } catch (err) {
    console.error("getDashboardSummary:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  getSDGProjectDistribution,
  getSDGParticipation,
  getSDGTrend,
  getDashboardSummary,
};