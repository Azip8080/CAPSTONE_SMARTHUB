import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  FileCheck2,
  FileDown,
  RefreshCw,
  FolderKanban,
  BookOpen,
  BrainCircuit,
  AlertCircle,
  CheckCircle2,
  Clock,
  CalendarClock,
} from "lucide-react";
import { api } from "../services/api";
import styles from "./CompletionReports.module.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SDGS = Array.from({ length: 17 }, (_, i) => `SDG ${i + 1}`);

const MODULE_OPTIONS = [
  { id: "projects", label: "Projects" },
  { id: "events", label: "Events" },
  { id: "knowledge", label: "Knowledge Hub" },
  { id: "ai", label: "AI Classifier" },
];

const EMPTY_SUMMARY = {
  totalRecords: 0,
  projects: 0,
  completedProjects: 0,
  ongoingProjects: 0,
  plannedProjects: 0,
  events: 0,
  completedEvents: 0,
  ongoingEvents: 0,
  plannedEvents: 0,
  knowledgeResources: 0,
  aiClassifications: 0,
};

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString();
}

function getRecordTitle(record) {
  return (
    record.title ||
    record.originalName ||
    record.filename ||
    record.document?.originalName ||
    record.document?.filename ||
    "Untitled record"
  );
}

function getRecordSDG(record) {
  if (record.sdgTag) return record.sdgTag;

  if (Array.isArray(record.sdgTags) && record.sdgTags.length) {
    return record.sdgTags.join(", ");
  }

  return "Not assigned";
}

function getNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeStatus(value) {
  const status = String(value || "").trim().toLowerCase();

  if (status === "completed" || status === "complete") return "Completed";
  if (status === "ongoing" || status === "in progress") return "Ongoing";
  if (status === "planned" || status === "pending") return "Planned";

  return value || "Recorded";
}

function getDocumentName(record) {
  return (
    record.document?.originalName ||
    record.document?.filename ||
    record.originalName ||
    record.filename ||
    record.documentName ||
    record.fileName ||
    (Array.isArray(record.documents)
      ? record.documents
          .map((document) =>
            typeof document === "string"
              ? document.split("/").pop()
              : document?.originalName ||
                document?.filename ||
                document?.name ||
                ""
          )
          .filter(Boolean)
          .join(", ")
      : "") ||
    "No uploaded document"
  );
}

function CompletionReports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sdg, setSdg] = useState("");
  const [barangay, setBarangay] = useState("");
  const [modules, setModules] = useState(
    MODULE_OPTIONS.map((item) => item.id)
  );

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [adminRecommendations, setAdminRecommendations] = useState("");
  const [savingRecommendations, setSavingRecommendations] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [recommendationMessage, setRecommendationMessage] = useState("");
  const [recommendationError, setRecommendationError] = useState(false);

  const [showAllRecords, setShowAllRecords] = useState(false);

  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams();

    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (sdg) params.set("sdg", sdg);
    if (barangay.trim()) params.set("barangay", barangay.trim());

    params.set("modules", modules.join(","));

    return params;
  }, [from, to, sdg, barangay, modules]);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = buildFilterParams();
      const response = await api.get(
        `/completion-reports?${params.toString()}`
      );

      if (response.success === false) {
        throw new Error(
          response.message || "Unable to load completion report."
        );
      }

      setReport(response);
      setShowAllRecords(false);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load the report. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  }, [buildFilterParams]);

  const loadRecommendations = useCallback(async () => {
    setRecommendationsLoading(true);
    setRecommendationMessage("");
    setRecommendationError(false);

    try {
      const params = buildFilterParams();
      const response = await api.get(
        `/completion-reports/recommendations?${params.toString()}`
      );

      if (response.success === false) {
        throw new Error(
          response.message || "Unable to load saved recommendations."
        );
      }

      setAdminRecommendations(response.text || "");
    } catch (err) {
      setRecommendationError(true);
      setRecommendationMessage(
        err.message || "Unable to load saved recommendations."
      );
    } finally {
      setRecommendationsLoading(false);
    }
  }, [buildFilterParams]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const saveRecommendations = async () => {
    setSavingRecommendations(true);
    setRecommendationMessage("");
    setRecommendationError(false);

    try {
      const params = buildFilterParams();
      const response = await api.put(
        `/completion-reports/recommendations?${params.toString()}`,
        { text: adminRecommendations }
      );

      if (response.success === false) {
        throw new Error(
          response.message || "Unable to save recommendations."
        );
      }

      setAdminRecommendations(response.text ?? adminRecommendations);
      setRecommendationMessage("Recommendations saved successfully.");
    } catch (err) {
      setRecommendationError(true);
      setRecommendationMessage(
        err.message || "Unable to save recommendations."
      );
    } finally {
      setSavingRecommendations(false);
    }
  };

  const summary = report?.summary || EMPTY_SUMMARY;
  const records = report?.records || [];
  const activeModuleCount = modules.length;

  const visibleRecords = showAllRecords
    ? records
    : records.slice(0, 5);

  const moduleCounts = useMemo(
    () => [
      {
        label: "Projects",
        value: summary.projects,
        icon: FolderKanban,
      },
      {
        label: "Events",
        value: summary.events,
        icon: CalendarDays,
      },
      {
        label: "Knowledge resources",
        value: summary.knowledgeResources,
        icon: BookOpen,
      },
      {
        label: "AI documents",
        value: summary.aiClassifications,
        icon: BrainCircuit,
      },
    ],
    [summary]
  );

  const toggleModule = (id) => {
    setModules((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  };

  const resetFilters = () => {
    setFrom("");
    setTo("");
    setSdg("");
    setBarangay("");
    setModules(MODULE_OPTIONS.map((item) => item.id));
    setShowAllRecords(false);
  };

  const generatedAt = report?.generatedAt
    ? new Date(report.generatedAt).toLocaleString()
    : new Date().toLocaleString();

  const exportPDF = async () => {
    if (!report) return;

    const analyticsRange = "all";
    const analyticsResults = await Promise.allSettled([
      api.get(`/analytics/distribution?range=${analyticsRange}`),
      api.get(`/analytics/trend?metric=projects&range=${analyticsRange}`),
      api.get(`/analytics/trend?metric=users&range=${analyticsRange}`),
      api.get(`/analytics/trend?metric=events&range=${analyticsRange}`),
    ]);

    const extractRows = (result) => {
      if (result.status !== "fulfilled") return [];
      const payload = result.value?.data ?? result.value;
      if (Array.isArray(payload)) return payload;
      if (Array.isArray(payload?.data)) return payload.data;
      if (Array.isArray(payload?.results)) return payload.results;
      return [];
    };

    const distributionRows = extractRows(analyticsResults[0]);
    const trendRows = {
      projects: extractRows(analyticsResults[1]),
      users: extractRows(analyticsResults[2]),
      events: extractRows(analyticsResults[3]),
    };

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    const green = [27, 77, 62];
    const lightGreen = [231, 241, 235];
    const blue = [37, 99, 235];
    const orange = [234, 126, 48];
    const muted = [95, 108, 101];
    const bottomLimit = pageHeight - 19;
    let y = 18;

    const addSectionTitle = (title) => {
      if (y + 15 > bottomLimit) {
        doc.addPage();
        y = 18;
      }

      doc.setFillColor(...lightGreen);
      doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...green);
      doc.text(title, margin + 3, y + 6);
      y += 14;
    };

    const ensureSpace = (required = 25) => {
      if (y + required > bottomLimit) {
        doc.addPage();
        y = 18;
      }
    };

    const addMetricTable = (headers, values) => {
      ensureSpace(25);
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin, bottom: 18 },
        head: [headers],
        body: [values.map((value) => String(value ?? 0))],
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 4,
          halign: "center",
          textColor: [50, 58, 52],
        },
        headStyles: {
          fillColor: green,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
      });
      y = doc.lastAutoTable.finalY + 8;
    };

    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();

      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        doc.setDrawColor(220, 229, 222);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...muted);
        doc.text("SDG SMART HUB | ANALYTICS AND COMPLETION REPORT", margin, pageHeight - 7);
        doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 7, {
          align: "right",
        });
      }
    };

    const projectRecords = records.filter((record) =>
      String(record.reportModule || "").toLowerCase().includes("project")
    );
    const eventRecords = records.filter((record) =>
      String(record.reportModule || "").toLowerCase().includes("event")
    );

    const getStatusCount = (items, status) =>
      items.filter((item) => normalizeStatus(item.status) === status).length;

    const projectTotal = getNumber(summary.projects);
    const eventTotal = getNumber(summary.events);
    const projectCompleted = getNumber(summary.completedProjects);
    const projectOngoing = getNumber(summary.ongoingProjects);
    const projectPlanned = getNumber(summary.plannedProjects);
    const eventCompleted = getNumber(summary.completedEvents);
    const eventOngoing = getNumber(summary.ongoingEvents);
    const eventPlanned = getNumber(summary.plannedEvents);

    const selectedModules = MODULE_OPTIONS.filter((item) =>
      modules.includes(item.id)
    ).map((item) => item.label).join(", ");

    const getSDGNumbers = (record) => {
      const values = [
        record.sdgTag,
        record.sdgTags,
        record.sdg,
        record.sdgNumber,
        record.sdgGoal,
        record.tags,
      ];
      const found = new Set();

      const collect = (value) => {
        if (value === null || value === undefined || value === "") return;

        if (Array.isArray(value)) {
          value.forEach(collect);
          return;
        }

        if (typeof value === "object") {
          collect(value.sdgTag);
          collect(value.tag);
          collect(value.name);
          collect(value.number);
          return;
        }

        const match = String(value).match(/(?:SDG\s*)?(\d{1,2})/i);
        if (match) {
          const number = Number(match[1]);
          if (number >= 1 && number <= 17) found.add(number);
        }
      };

      values.forEach(collect);
      return [...found];
    };

    const sdgCounts = Array.from({ length: 17 }, (_, index) => ({
      number: index + 1,
      projects: 0,
      events: 0,
    }));

    records.forEach((record) => {
      const moduleName = String(record.reportModule || "").toLowerCase();
      const isProject = moduleName.includes("project");
      const isEvent = moduleName.includes("event");
      if (!isProject && !isEvent) return;

      getSDGNumbers(record).forEach((number) => {
        const item = sdgCounts[number - 1];
        if (isProject) item.projects += 1;
        if (isEvent) item.events += 1;
      });
    });

    const topSDGs = sdgCounts
      .map((item) => ({ ...item, total: item.projects + item.events }))
      .filter((item) => item.total > 0)
      .sort((a, b) => b.total - a.total || a.number - b.number)
      .slice(0, 10);

    const totalProjectParticipation = topSDGs.reduce((sum, item) => sum + item.projects, 0);
    const totalEventParticipation = topSDGs.reduce((sum, item) => sum + item.events, 0);

    const sdgChartColors = [
      "#E5243B", "#DDA63A", "#4C9F38", "#C5192D", "#FF3A21",
      "#26BDE2", "#FCC30B", "#A21942", "#FD6925", "#DD1367",
      "#FD9D24", "#BF8B2E", "#3F7E44", "#0A97D9", "#56C02B",
      "#00689D", "#19486A",
    ];

    const trendLabels = [
      ...new Set([
        ...trendRows.projects.map((item) => String(item.label ?? item.date ?? "")),
        ...trendRows.users.map((item) => String(item.label ?? item.date ?? "")),
        ...trendRows.events.map((item) => String(item.label ?? item.date ?? "")),
      ]),
    ];

    const trendValueMap = (rows) =>
      new Map(rows.map((item) => [
        String(item.label ?? item.date ?? ""),
        Number(item.total ?? item.count ?? 0),
      ]));

    const projectTrendMap = trendValueMap(trendRows.projects);
    const userTrendMap = trendValueMap(trendRows.users);
    const eventTrendMap = trendValueMap(trendRows.events);

    const analyticsCanvas = document.createElement("canvas");
    analyticsCanvas.width = 1800;
    analyticsCanvas.height = 1040;
    const chartCtx = analyticsCanvas.getContext("2d");

    const drawPanel = (x, y, width, height, title) => {
      chartCtx.fillStyle = "#FFFFFF";
      chartCtx.strokeStyle = "#D5DFED";
      chartCtx.lineWidth = 2;
      chartCtx.beginPath();
      chartCtx.roundRect(x, y, width, height, 18);
      chartCtx.fill();
      chartCtx.stroke();
      chartCtx.fillStyle = "#2F5488";
      chartCtx.font = "bold 27px Arial";
      chartCtx.fillText(title, x + 25, y + 45);
    };

    const drawPiePanel = (x, y, width, height) => {
      drawPanel(x, y, width, height, "Top 10 SDG Participation");
      const rows = topSDGs.slice(0, 10);
      const maxTotal = Math.max(...rows.map((item) => item.total), 1);
      const labelX = x + 28;
      const barX = x + 170;
      const barWidth = width - 290;
      const totalX = x + width - 72;
      const rowTop = y + 112;
      const rowGap = 35;

      chartCtx.font = "bold 15px Arial";
      chartCtx.fillStyle = "#64748B";
      chartCtx.fillText("SDG", labelX, y + 78);
      chartCtx.fillText("PROJECT / EVENT PARTICIPATION", barX, y + 78);
      chartCtx.textAlign = "right";
      chartCtx.fillText("TOTAL", totalX + 28, y + 78);
      chartCtx.textAlign = "left";

      rows.forEach((item, index) => {
        const rowY = rowTop + index * rowGap;
        const color = sdgChartColors[item.number - 1];
        const projectWidth = (item.projects / maxTotal) * barWidth;
        const eventWidth = (item.events / maxTotal) * barWidth;

        chartCtx.fillStyle = color;
        chartCtx.beginPath();
        chartCtx.roundRect(labelX, rowY - 16, 64, 24, 7);
        chartCtx.fill();
        chartCtx.fillStyle = "#FFFFFF";
        chartCtx.font = "bold 14px Arial";
        chartCtx.fillText(`SDG ${item.number}`, labelX + 8, rowY + 1);

        chartCtx.fillStyle = "#E9EEF5";
        chartCtx.beginPath();
        chartCtx.roundRect(barX, rowY - 11, barWidth, 14, 7);
        chartCtx.fill();
        if (projectWidth > 0) {
          chartCtx.fillStyle = color;
          chartCtx.beginPath();
          chartCtx.roundRect(barX, rowY - 11, projectWidth, 14, 7);
          chartCtx.fill();
        }
        if (eventWidth > 0) {
          chartCtx.fillStyle = "#F59E0B";
          chartCtx.fillRect(barX + projectWidth, rowY - 11, eventWidth, 14);
        }

        chartCtx.fillStyle = "#64748B";
        chartCtx.font = "12px Arial";
        chartCtx.fillText(`${item.projects} projects  |  ${item.events} events`, barX, rowY + 17);
        chartCtx.fillStyle = "#2F5488";
        chartCtx.font = "bold 19px Arial";
        chartCtx.textAlign = "right";
        chartCtx.fillText(String(item.total), totalX + 28, rowY + 2);
        chartCtx.textAlign = "left";
      });

      const footerY = y + height - 25;
      chartCtx.fillStyle = "#64748B";
      chartCtx.font = "bold 16px Arial";
      chartCtx.fillText(`Projects: ${totalProjectParticipation}`, labelX, footerY);
      chartCtx.fillStyle = "#D97706";
      chartCtx.fillText(`Events: ${totalEventParticipation}`, labelX + 210, footerY);
      chartCtx.fillStyle = "#2F5488";
      chartCtx.fillText(`Total: ${totalProjectParticipation + totalEventParticipation}`, labelX + 390, footerY);
    };

    const drawDistributionPanel = (x, y, width, height) => {
      drawPanel(x, y, width, height, "Project Distribution by SDG");
      const rows = distributionRows
        .map((item) => ({ ...item, count: Number(item.count || 0) }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 17);
      const labelX = x + 28;
      const barX = x + 170;
      const barWidth = width - 235;
      const rowTop = y + 82;
      const rowGap = Math.min(22, (height - 112) / Math.max(rows.length, 1));
      const max = Math.max(...rows.map((item) => item.count), 1);

      chartCtx.font = "bold 14px Arial";
      chartCtx.fillStyle = "#64748B";
      chartCtx.fillText("SDG", labelX, y + 68);
      chartCtx.fillText("PROJECTS", barX, y + 68);

      rows.forEach((item, index) => {
        const rowY = rowTop + index * rowGap;
        const color = item.color || "#4470AD";
        const currentBarWidth = (item.count / max) * barWidth;

        chartCtx.fillStyle = "#334155";
        chartCtx.font = "bold 13px Arial";
        chartCtx.fillText(item.tag || `SDG ${index + 1}`, labelX, rowY + 3);
        chartCtx.fillStyle = "#EEF2F7";
        chartCtx.beginPath();
        chartCtx.roundRect(barX, rowY - 9, barWidth, 13, 6);
        chartCtx.fill();
        chartCtx.fillStyle = color;
        chartCtx.beginPath();
        chartCtx.roundRect(barX, rowY - 9, currentBarWidth, 13, 6);
        chartCtx.fill();
        chartCtx.fillStyle = "#334155";
        chartCtx.font = "bold 13px Arial";
        chartCtx.fillText(String(item.count), barX + barWidth + 12, rowY + 3);
      });

      if (!rows.length) {
        chartCtx.fillStyle = "#64748B";
        chartCtx.font = "20px Arial";
        chartCtx.fillText("No distribution data returned by the analytics API.", x + 30, y + 150);
      }
    };

    const drawTrendPanel = (x, y, width, height) => {
      drawPanel(x, y, width, height, "Daily SDG Activity Trend");
      const chartLeft = x + 70;
      const chartRight = x + width - 35;
      const chartTop = y + 105;
      const chartBottom = y + height - 65;
      const chartHeight = chartBottom - chartTop;
      const maxValue = Math.max(
        1,
        ...trendRows.projects.map((item) => Number(item.total ?? item.count ?? 0)),
        ...trendRows.users.map((item) => Number(item.total ?? item.count ?? 0)),
        ...trendRows.events.map((item) => Number(item.total ?? item.count ?? 0))
      );

      chartCtx.strokeStyle = "#E8EEF5";
      chartCtx.fillStyle = "#94A3B8";
      chartCtx.font = "15px Arial";
      for (let tick = 0; tick <= 4; tick++) {
        const lineY = chartBottom - (chartHeight * tick) / 4;
        chartCtx.beginPath();
        chartCtx.moveTo(chartLeft, lineY);
        chartCtx.lineTo(chartRight, lineY);
        chartCtx.stroke();
        chartCtx.fillText(String(Math.round((maxValue * tick) / 4)), x + 25, lineY + 5);
      }

      const series = [
        { name: "Projects", values: projectTrendMap, color: "#3B82F6" },
        { name: "Users", values: userTrendMap, color: "#16A34A" },
        { name: "Events", values: eventTrendMap, color: "#F59E0B" },
      ];

      series.forEach((item) => {
        if (!trendLabels.length) return;
        chartCtx.strokeStyle = item.color;
        chartCtx.lineWidth = 4;
        chartCtx.beginPath();
        trendLabels.forEach((label, index) => {
          const value = item.values.get(label) || 0;
          const pointX = chartLeft + (index / Math.max(trendLabels.length - 1, 1)) * (chartRight - chartLeft);
          const pointY = chartBottom - (value / maxValue) * chartHeight;
          if (index === 0) chartCtx.moveTo(pointX, pointY);
          else chartCtx.lineTo(pointX, pointY);
        });
        chartCtx.stroke();
      });

      chartCtx.font = "17px Arial";
      let legendX = chartLeft;
      series.forEach((item) => {
        chartCtx.fillStyle = item.color;
        chartCtx.fillRect(legendX, y + height - 35, 18, 6);
        chartCtx.fillStyle = "#64748B";
        chartCtx.fillText(item.name, legendX + 25, y + height - 29);
        legendX += 150;
      });

      if (!trendLabels.length) {
        chartCtx.fillStyle = "#64748B";
        chartCtx.font = "20px Arial";
        chartCtx.fillText("Trend data is unavailable for this reporting range.", chartLeft, y + 160);
      }
    };

    chartCtx.fillStyle = "#F3F6FA";
    chartCtx.fillRect(0, 0, analyticsCanvas.width, analyticsCanvas.height);
    drawPiePanel(20, 20, 865, 480);
    drawDistributionPanel(905, 20, 875, 480);
    drawTrendPanel(20, 520, 1760, 500);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(...green);
    doc.text("Dashboard Analytics Overview", margin, 16);
    doc.addImage(
      analyticsCanvas.toDataURL("image/png"),
      "PNG",
      margin,
      23,
      contentWidth,
      170
    );

    doc.addPage();

    doc.setFillColor(...green);
    doc.rect(0, 0, pageWidth, 4, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    doc.setTextColor(...green);
    doc.text("SDG SMART HUB", margin, y);
    doc.setFontSize(14);
    doc.setTextColor(45, 55, 48);
    doc.text("Complete Analytics and Completion Report", margin, y + 8);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`Generated: ${generatedAt}`, margin, y + 14);
    doc.text(`Period: ${from || "All dates"} to ${to || "Present"}`, pageWidth - margin, y, {
      align: "right",
    });
    doc.text(`SDG: ${sdg || "All SDGs"} | Community: ${barangay.trim() || "All barangays"}`, pageWidth - margin, y + 6, {
      align: "right",
    });
    doc.text(`Modules: ${selectedModules || "None"}`, pageWidth - margin, y + 12, {
      align: "right",
    });
    y += 24;

    addSectionTitle("Overall Analytics Summary");
    addMetricTable(
      ["Total Records", "Projects", "Events", "Knowledge Resources", "AI Classifications"],
      [
        getNumber(summary.totalRecords) || records.length,
        projectTotal,
        eventTotal,
        getNumber(summary.knowledgeResources),
        getNumber(summary.aiClassifications),
      ]
    );

    addSectionTitle("Project Status Analytics");
    addMetricTable(
      ["Total Projects", "Completed", "Ongoing", "Planned"],
      [projectTotal, projectCompleted, projectOngoing, projectPlanned]
    );

    addSectionTitle("Event Status Analytics");
    addMetricTable(
      ["Total Events", "Completed", "Ongoing", "Planned"],
      [eventTotal, eventCompleted, eventOngoing, eventPlanned]
    );

    addSectionTitle("Module Analytics");
    addMetricTable(
      ["Projects", "Events", "Knowledge Hub", "AI Classifier"],
      [
        getNumber(summary.projects),
        getNumber(summary.events),
        getNumber(summary.knowledgeResources),
        getNumber(summary.aiClassifications),
      ]
    );

    addSectionTitle("SDG Analytics — Top 10 Goals");
    addMetricTable(
      ["Project Participations", "Event Participations", "Total Participations"],
      [
        totalProjectParticipation,
        totalEventParticipation,
        totalProjectParticipation + totalEventParticipation,
      ]
    );

    if (topSDGs.length) {
      ensureSpace(24 + topSDGs.length * 9);
      const chartX = margin + 39;
      const chartWidth = contentWidth - 95;
      const labelX = margin + 2;
      const countX = pageWidth - margin - 2;
      const maxValue = Math.max(...topSDGs.map((item) => item.total), 1);
      const rowHeight = 9;

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");

      topSDGs.forEach((item) => {
        doc.setTextColor(45, 55, 48);
        doc.text(`SDG ${item.number}`, labelX, y + 5.5);

        const projectWidth = (item.projects / maxValue) * chartWidth;
        const eventWidth = (item.events / maxValue) * chartWidth;

        doc.setFillColor(...blue);
        if (projectWidth > 0) {
          doc.roundedRect(chartX, y + 1, projectWidth, 5, 1, 1, "F");
        }

        doc.setFillColor(...orange);
        if (eventWidth > 0) {
          doc.rect(chartX + projectWidth, y + 1, eventWidth, 5, "F");
        }

        doc.setTextColor(...muted);
        doc.text(
          `${item.total} (P:${item.projects} / E:${item.events})`,
          countX,
          y + 5.5,
          { align: "right" }
        );
        y += rowHeight;
      });

      y += 2;
      doc.setFillColor(...blue);
      doc.rect(margin + 3, y, 4, 4, "F");
      doc.setTextColor(...muted);
      doc.text("Projects", margin + 9, y + 3.3);
      doc.setFillColor(...orange);
      doc.rect(margin + 34, y, 4, 4, "F");
      doc.text("Events", margin + 40, y + 3.3);
      y += 10;
    } else {
      doc.setFontSize(9);
      doc.setTextColor(...muted);
      doc.text("No SDG-tagged project or event records match the selected filters.", margin + 2, y + 4);
      y += 12;
    }

    addSectionTitle("Project Showcase — Uploaded Documents and Status");
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin, bottom: 18 },
      head: [["Project Title", "Uploaded Document", "Status", "SDG", "Barangay", "Date"]],
      body: projectRecords.length
        ? projectRecords.map((record) => [
            getRecordTitle(record),
            getDocumentName(record),
            normalizeStatus(record.status),
            getRecordSDG(record),
            record.barangay || "—",
            formatDate(record.createdAt || record.date),
          ])
        : [["No project records found", "—", "—", "—", "—", "—"]],
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
        valign: "top",
        textColor: [50, 58, 52],
      },
      headStyles: {
        fillColor: green,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 248] },
      columnStyles: {
        0: { cellWidth: 52 },
        1: { cellWidth: 65 },
        2: { cellWidth: 28 },
        3: { cellWidth: 37 },
        4: { cellWidth: 40 },
        5: { cellWidth: 28 },
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    addSectionTitle("Event Records");
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin, bottom: 18 },
      head: [["Event Title", "Status", "SDG", "Barangay", "Date"]],
      body: eventRecords.length
        ? eventRecords.map((record) => [
            getRecordTitle(record),
            normalizeStatus(record.status),
            getRecordSDG(record),
            record.barangay || "—",
            formatDate(record.date || record.createdAt),
          ])
        : [["No event records found", "—", "—", "—", "—"]],
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 3,
        overflow: "linebreak",
        valign: "top",
        textColor: [50, 58, 52],
      },
      headStyles: {
        fillColor: green,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 248] },
    });
    y = doc.lastAutoTable.finalY + 8;

    addSectionTitle("All Included Records");
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin, bottom: 18 },
      head: [["Module", "Record", "SDG", "Barangay", "Status", "Date"]],
      body: records.length
        ? records.map((record) => [
            record.reportModule || "—",
            getRecordTitle(record),
            getRecordSDG(record),
            record.barangay || "—",
            normalizeStatus(record.status),
            formatDate(record.createdAt || record.date),
          ])
        : [["No matching records", "—", "—", "—", "—", "—"]],
      theme: "striped",
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        overflow: "linebreak",
        valign: "top",
        textColor: [50, 58, 52],
      },
      headStyles: {
        fillColor: green,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: { fillColor: [248, 250, 248] },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 65 },
        2: { cellWidth: 35 },
        3: { cellWidth: 42 },
        4: { cellWidth: 28 },
        5: { cellWidth: 30 },
      },
    });
    y = doc.lastAutoTable.finalY + 8;

    if (adminRecommendations.trim()) {
      addSectionTitle("Admin Recommendations");
      const recommendationLines = doc.splitTextToSize(
        adminRecommendations.trim(),
        contentWidth - 6
      );
      const recommendationHeight = recommendationLines.length * 4.5 + 8;
      ensureSpace(recommendationHeight);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(50, 58, 52);
      doc.text(recommendationLines, margin + 3, y + 3);
      y += recommendationHeight;
    }

    if (report.limitations?.length) {
      addSectionTitle("Data Limitations and Interpretation");
      report.limitations.forEach((item) => {
        const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 6);
        ensureSpace(lines.length * 4.5 + 5);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(50, 58, 52);
        doc.text(lines, margin + 3, y + 3);
        y += lines.length * 4.5 + 3;
      });
    }

    addFooter();

    const dateStamp = new Date().toISOString().slice(0, 10);
    doc.save(`SDG-Smart-Hub-Complete-Analytics-Report-${dateStamp}.pdf`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>ADMIN PANEL / REPORTING</div>
          <h1>Project Progress & Reports</h1>
          <p>
            Review project progress, total events, and project showcase documents.
          </p>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={loadReport}
            disabled={loading}
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            className={styles.primaryButton}
            onClick={exportPDF}
            disabled={!report || loading}
          >
            <FileDown size={16} />
            Export / Save PDF
          </button>
        </div>
      </header>

      <section className={styles.filters}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>Report filters</h2>
            <p>Choose the records and reporting period to include.</p>
          </div>
        </div>

        <div className={styles.filterGrid}>
          <label>
            From date
            <input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>

          <label>
            To date
            <input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>

          <label>
            Sustainable Development Goal
            <select
              value={sdg}
              onChange={(event) => setSdg(event.target.value)}
            >
              <option value="">All SDGs</option>
              {SDGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </label>

          <label>
            Barangay or community
            <input
              value={barangay}
              onChange={(event) => setBarangay(event.target.value)}
              placeholder="All barangays"
            />
          </label>
        </div>

        <div className={styles.moduleFilter}>
          <span className={styles.filterLabel}>Include modules</span>

          <div className={styles.checkList}>
            {MODULE_OPTIONS.map((item) => (
              <label key={item.id} className={styles.checkOption}>
                <input
                  type="checkbox"
                  checked={modules.includes(item.id)}
                  onChange={() => toggleModule(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.filterFooter}>
          <span>
            {activeModuleCount} of {MODULE_OPTIONS.length} modules selected
          </span>

          <button
            type="button"
            className={styles.textButton}
            onClick={resetFilters}
          >
            Reset filters
          </button>
        </div>
      </section>

      {error && (
        <div className={styles.errorBanner} role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>Unable to load completion report</strong>
            <p>{error}</p>
            <p>
              Confirm that the backend route is registered and the server is running.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className={styles.loading}>
          <RefreshCw size={20} className={styles.spin} />
          Compiling records...
        </div>
      )}

      {!loading && report && (
        <div className={styles.reportBody}>
          <section className={styles.reportIdentity}>
            <div className={styles.reportIdentityIcon}>
              <FileCheck2 size={25} />
            </div>

            <div>
              <span className={styles.eyebrow}>SDG SMART HUB</span>
              <h2>Project and Event Completion Report</h2>
              <p>Generated {generatedAt}</p>
            </div>
          </section>

          <section className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span>Total Projects</span>
              <strong>{summary.projects ?? 0}</strong>
              <small>All matching project records</small>
            </article>

            <article className={styles.summaryCard}>
              <span>Total Events</span>
              <strong>{summary.events ?? 0}</strong>
              <small>All matching event records</small>
            </article>

            <article className={styles.summaryCard}>
              <span>Completed Projects</span>
              <strong>{summary.completedProjects ?? 0}</strong>
              <small>Finished projects</small>
            </article>

            <article className={styles.summaryCard}>
              <span>Completed Events</span>
              <strong>{summary.completedEvents ?? 0}</strong>
              <small>Finished events</small>
            </article>
          </section>

          <section className={styles.reportSection}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Project Status Summary</h2>
                <p>Completed, ongoing, and planned projects.</p>
              </div>
            </div>

            <div className={styles.summaryGrid}>
              <article className={styles.summaryCard}>
                <CheckCircle2 size={22} color="#16A34A" />
                <span>Completed Projects</span>
                <strong>{summary.completedProjects ?? 0}</strong>
              </article>

              <article className={styles.summaryCard}>
                <Clock size={22} color="#D97706" />
                <span>Ongoing Projects</span>
                <strong>{summary.ongoingProjects ?? 0}</strong>
              </article>

              <article className={styles.summaryCard}>
                <CalendarClock size={22} color="#2563EB" />
                <span>Planned Projects</span>
                <strong>{summary.plannedProjects ?? 0}</strong>
              </article>
            </div>
          </section>

          <section className={styles.moduleSection}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Module summary</h2>
                <p>Number of records returned from each selected module.</p>
              </div>
            </div>

            <div className={styles.moduleGrid}>
              {moduleCounts.map((item) => {
                const Icon = item.icon;

                return (
                  <article className={styles.moduleCard} key={item.label}>
                    <Icon size={20} />
                    <span>{item.label}</span>
                    <strong>{item.value ?? 0}</strong>
                  </article>
                );
              })}
            </div>
          </section>

          <section className={styles.reportSection}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Project Showcase Documents</h2>
                <p>Uploaded project documents and their current status.</p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Project</th>
                    <th>Uploaded Document</th>
                    <th>Status</th>
                    <th>SDG</th>
                    <th>Barangay</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {records
                    .filter((record) =>
                      String(record.reportModule || "")
                        .toLowerCase()
                        .includes("project")
                    )
                    .map((record, index) => (
                      <tr key={record._id || index}>
                        <td className={styles.recordTitle}>
                          {getRecordTitle(record)}
                        </td>
                        <td>{getDocumentName(record)}</td>
                        <td>{normalizeStatus(record.status)}</td>
                        <td>{getRecordSDG(record)}</td>
                        <td>{record.barangay || "—"}</td>
                        <td>{formatDate(record.createdAt || record.date)}</td>
                      </tr>
                    ))}

                  {records.filter((record) =>
                    String(record.reportModule || "")
                      .toLowerCase()
                      .includes("project")
                  ).length === 0 && (
                    <tr>
                      <td colSpan="6" className={styles.emptyCell}>
                        No project showcase records match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.reportSection}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Admin Recommendations</h2>
                <p>
                  Write recommendations for this report. They are saved
                  separately for the current filters.
                </p>
              </div>
            </div>

            <textarea
              value={adminRecommendations}
              onChange={(event) => setAdminRecommendations(event.target.value)}
              placeholder="Type the administrator's recommendations and follow-up actions..."
              rows={7}
              maxLength={20000}
              aria-label="Admin recommendations"
              disabled={recommendationsLoading}
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                padding: "14px",
                border: "1px solid #d5ded8",
                borderRadius: "10px",
                resize: "vertical",
                font: "inherit",
                lineHeight: 1.6,
                background: "#fff",
                color: "#26352d",
              }}
            />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginTop: "12px",
              }}
            >
              <button
                type="button"
                className={styles.primaryButton}
                onClick={saveRecommendations}
                disabled={savingRecommendations || recommendationsLoading}
              >
                {savingRecommendations ? "Saving..." : "Save Recommendations"}
              </button>

              {recommendationMessage && (
                <span
                  role="status"
                  aria-live="polite"
                  style={{
                    color: recommendationError ? "#b42318" : "#216e45",
                  }}
                >
                  {recommendationMessage}
                </span>
              )}
            </div>
          </section>

          <section className={styles.reportSection}>
            <div className={styles.sectionHeading}>
              <div>
                <h2>Included Records</h2>
                <p>
                  Showing {visibleRecords.length} of {records.length} records
                  matching the current filters.
                </p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>Module</th>
                    <th>Record</th>
                    <th>SDG</th>
                    <th>Barangay</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleRecords.map((record, index) => (
                    <tr
                      key={
                        record._id ||
                        `${record.reportModule}-${index}`
                      }
                    >
                      <td>{record.reportModule || "—"}</td>
                      <td className={styles.recordTitle}>
                        {getRecordTitle(record)}
                      </td>
                      <td>{getRecordSDG(record)}</td>
                      <td>{record.barangay || "—"}</td>
                      <td>{normalizeStatus(record.status)}</td>
                      <td>{formatDate(record.createdAt || record.date)}</td>
                    </tr>
                  ))}

                  {records.length === 0 && (
                    <tr>
                      <td colSpan="6" className={styles.emptyCell}>
                        No records match the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {records.length > 5 && (
              <div className={styles.viewMoreContainer}>
                <button
                  type="button"
                  className={styles.viewMoreButton}
                  onClick={() =>
                    setShowAllRecords((current) => !current)
                  }
                >
                  {showAllRecords ? "Show Less" : "View More Records"}
                </button>
              </div>
            )}
          </section>

          {report.limitations?.length > 0 && (
            <section className={styles.limitations}>
              <h2>Data limitations and interpretation</h2>
              <ul>
                {report.limitations.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          <footer className={styles.reportFooter}>
            <span>SDG SMART HUB · PROJECT AND EVENT REPORT</span>
            <span>Generated from records available in the system.</span>
          </footer>
        </div>
      )}
    </div>
  );
}

export default CompletionReports;