const express = require("express");
const router = express.Router();

const Project = require("../models/Project");
const Event = require("../models/Event");
const KnowledgeArticle = require("../models/KnowledgeArticle");
const UploadedDocument = require("../models/UploadedDocument");
const CompletionReport = require("../models/CompletionReport");

const auth = require("../middleware/auth");
const adminOnly = require("../middleware/adminOnly");

const SDG_TAGS = Array.from({ length: 17 }, (_, i) => `SDG ${i + 1}`);
const MODULES = ["projects", "events", "knowledge", "ai"];

function validDate(value, endOfDay = false) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  if (endOfDay) {
    date.setHours(23, 59, 59, 999);
  } else {
    date.setHours(0, 0, 0, 0);
  }

  return date;
}

function dateFilter(from, to, field = "createdAt") {
  const filter = {};

  if (from || to) {
    filter[field] = {};

    if (from) filter[field].$gte = from;
    if (to) filter[field].$lte = to;
  }

  return filter;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchesSDG(tag, sdg) {
  return !sdg || tag === sdg;
}

function getReportFilters(query) {
  const from = String(query.from || "").trim();
  const to = String(query.to || "").trim();

  const requestedSDG = String(query.sdg || "").trim();
  const sdg = SDG_TAGS.includes(requestedSDG) ? requestedSDG : "";

  const barangay = String(query.barangay || "").trim();

  const requestedModules =
    query.modules === undefined
      ? MODULES
      : String(query.modules)
          .split(",")
          .map((value) => value.trim().toLowerCase())
          .filter((value) => MODULES.includes(value));

  const modules = MODULES.filter((module) =>
    requestedModules.includes(module)
  );

  const filters = {
    from,
    to,
    sdg,
    barangay,
    modules,
  };

  const filterKey = JSON.stringify(filters);

  return { filters, filterKey };
}

router.get("/recommendations", auth, adminOnly, async (req, res) => {
  try {
    const { filters, filterKey } = getReportFilters(req.query);

    const saved = await CompletionReport.findOne({
      filterKey,
    }).lean();

    return res.json({
      success: true,
      text: saved?.recommendations || "",
      updatedAt: saved?.updatedAt || null,
      filters,
    });
  } catch (error) {
    console.error("Load completion recommendations error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load saved recommendations.",
    });
  }
});

router.put("/recommendations", auth, adminOnly, async (req, res) => {
  try {
    const { filters, filterKey } = getReportFilters(req.query);

    const text =
      typeof req.body?.text === "string" ? req.body.text : "";

    if (text.length > 20000) {
      return res.status(400).json({
        success: false,
        message: "Recommendations must be 20,000 characters or fewer.",
      });
    }

    const saved = await CompletionReport.findOneAndUpdate(
      { filterKey },
      {
        $set: {
          filterKey,
          filters,
          recommendations: text.trim(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.json({
      success: true,
      message: "Recommendations saved successfully.",
      text: saved.recommendations,
      updatedAt: saved.updatedAt,
      filters: saved.filters,
    });
  } catch (error) {
    console.error("Save completion recommendations error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to save recommendations.",
    });
  }
});

router.get("/", auth, adminOnly, async (req, res) => {
  try {
    const from = validDate(req.query.from);
    const to = validDate(req.query.to, true);

    const sdg = SDG_TAGS.includes(req.query.sdg) ? req.query.sdg : "";

    const barangay = String(req.query.barangay || "").trim();

    const requestedModules =
      req.query.modules === undefined
        ? MODULES
        : String(req.query.modules)
            .split(",")
            .map((value) => value.trim().toLowerCase())
            .filter((value) => MODULES.includes(value));

    const selected = new Set(requestedModules);

    const [allProjects, allEvents, allKnowledge, allAI] =
      await Promise.all([
        selected.has("projects")
          ? Project.find({
              ...dateFilter(from, to),
              ...(barangay
                ? {
                    barangay: new RegExp(
                      `^${escapeRegex(barangay)}$`,
                      "i"
                    ),
                  }
                : {}),
            })
              .sort({ createdAt: -1 })
              .lean()
          : [],

        selected.has("events")
          ? Event.find(dateFilter(from, to, "date"))
              .sort({ date: -1 })
              .lean()
          : [],

        selected.has("knowledge")
          ? KnowledgeArticle.find(dateFilter(from, to))
              .sort({ createdAt: -1 })
              .lean()
          : [],

        selected.has("ai")
          ? UploadedDocument.find(dateFilter(from, to))
              .sort({ createdAt: -1 })
              .lean()
          : [],
      ]);

    const projects = allProjects.filter(
      (item) =>
        matchesSDG(item.sdgTag, sdg) ||
        (Array.isArray(item.sdgTags) && item.sdgTags.includes(sdg))
    );

    const events = allEvents.filter((item) =>
      matchesSDG(item.sdgTag, sdg)
    );

    const knowledge = allKnowledge.filter((item) =>
      matchesSDG(item.sdgTag, sdg)
    );

    const aiDocuments = allAI;

    const completed = projects.filter(
      (item) => item.status === "Completed"
    ).length;

    const ongoing = projects.filter(
      (item) => item.status === "Ongoing"
    ).length;

    const planned = projects.filter(
      (item) => item.status === "Planned"
    ).length;

    const projectCount = projects.length;

    const completionRate = projectCount
      ? Math.round((completed / projectCount) * 100)
      : 0;

    const sdgDistribution = SDG_TAGS.map((tag) => {
      const projectTotal = projects.filter(
        (item) =>
          item.sdgTag === tag ||
          (Array.isArray(item.sdgTags) && item.sdgTags.includes(tag))
      ).length;

      const eventTotal = events.filter(
        (item) => item.sdgTag === tag
      ).length;

      const knowledgeTotal = knowledge.filter(
        (item) => item.sdgTag === tag
      ).length;

      return {
        sdg: tag,
        projects: projectTotal,
        events: eventTotal,
        knowledgeResources: knowledgeTotal,
        total: projectTotal + eventTotal + knowledgeTotal,
      };
    });

    const records = [
      ...projects.map((item) => ({
        ...item,
        reportModule: "Project",
      })),

      ...events.map((item) => ({
        ...item,
        reportModule: "Event",
      })),

      ...knowledge.map((item) => ({
        ...item,
        reportModule: "Knowledge Hub",
      })),

      ...aiDocuments.map((item) => ({
        ...item,
        reportModule: "AI Classification",
      })),
    ].sort(
      (a, b) =>
        new Date(b.createdAt || b.date || 0) -
        new Date(a.createdAt || a.date || 0)
    );

    return res.json({
      success: true,

      filters: {
        from: from ? from.toISOString() : null,
        to: to ? to.toISOString() : null,
        sdg,
        barangay,
        modules: [...selected],
      },

      generatedAt: new Date().toISOString(),

      summary: {
        totalRecords: records.length,
        projects: projectCount,
        completedProjects: completed,
        ongoingProjects: ongoing,
        plannedProjects: planned,
        completionRate,
        events: events.length,
        knowledgeResources: knowledge.length,
        aiClassifications: aiDocuments.length,
      },

      sdgDistribution,
      records,

      limitations: [
        "Barangay filtering applies only to Projects because the other models do not currently store a barangay field.",
        "AI classification counts represent uploaded document records, not verified unique projects.",
        ...(sdg
          ? [
              "AI uploads are not filtered by SDG because the UploadedDocument model does not store an SDG field.",
            ]
          : []),
      ],
    });
  } catch (error) {
    console.error("Completion report error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to compile the completion report.",
    });
  }
});

module.exports = router;