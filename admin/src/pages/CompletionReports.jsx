import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ChartNoAxesCombined,
  FileCheck2,
  FileDown,
  RefreshCw,
  FolderKanban,
  BookOpen,
  BrainCircuit,
  AlertCircle,
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
  completionRate: 0,
  events: 0,
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

  const buildFilterParams = useCallback(() => {
    const params = new URLSearchParams();

    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (sdg) params.set("sdg", sdg);

    if (barangay.trim()) {
      params.set("barangay", barangay.trim());
    }

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
  const distribution = report?.sdgDistribution || [];
  const records = report?.records || [];

  const activeModuleCount = modules.length;

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
  };

  const generatedAt = report?.generatedAt
    ? new Date(report.generatedAt).toLocaleString()
    : "Not generated";

  const exportPDF = () => {
    if (!report) return;

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
    const muted = [95, 108, 101];
    let y = 18;

    const checkPageSpace = (requiredHeight = 15) => {
      if (y + requiredHeight > pageHeight - 16) {
        doc.addPage();
        y = 18;
      }
    };

    const addSectionTitle = (title) => {
      checkPageSpace(13);

      doc.setFillColor(...lightGreen);
      doc.roundedRect(margin, y - 5, contentWidth, 9, 1.5, 1.5, "F");

      doc.setTextColor(...green);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(title, margin + 3, y + 1);

      doc.setTextColor(40, 48, 43);
      y += 11;
    };

    const addMetricCard = (x, cardY, width, label, value, detail) => {
      doc.setFillColor(248, 250, 248);
      doc.setDrawColor(220, 229, 222);
      doc.roundedRect(x, cardY, width, 23, 2, 2, "FD");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(...muted);
      doc.text(label, x + 4, cardY + 6);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(...green);
      doc.text(String(value), x + 4, cardY + 14);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text(detail, x + 4, cardY + 19);
    };

    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();

      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);

        doc.setDrawColor(220, 229, 222);
        doc.setLineWidth(0.3);
        doc.line(
          margin,
          pageHeight - 12,
          pageWidth - margin,
          pageHeight - 12
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...muted);

        doc.text(
          "SDG SMART HUB | CONSOLIDATED COMPLETION REPORT",
          margin,
          pageHeight - 7
        );

        doc.text(
          `Page ${page} of ${pageCount}`,
          pageWidth - margin,
          pageHeight - 7,
          { align: "right" }
        );
      }
    };

    const selectedModules = MODULE_OPTIONS.filter((item) =>
      modules.includes(item.id)
    )
      .map((item) => item.label)
      .join(", ");

    doc.setFillColor(...green);
    doc.rect(0, 0, pageWidth, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    doc.setTextColor(...green);
    doc.text("SDG SMART HUB", margin, y);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(45, 55, 48);
    doc.text("Consolidated Completion Report", margin, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`Generated: ${generatedAt}`, margin, y + 14);

    const metadataX = pageWidth - margin;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...green);
    doc.text("REPORT DETAILS", metadataX, y, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(60, 68, 62);

    doc.text(
      `Period: ${from || "All dates"} to ${to || "Present"}`,
      metadataX,
      y + 6,
      { align: "right" }
    );

    doc.text(
      `SDG: ${sdg || "All SDGs"}`,
      metadataX,
      y + 11,
      { align: "right" }
    );

    doc.text(
      `Community: ${barangay.trim() || "All barangays"}`,
      metadataX,
      y + 16,
      { align: "right" }
    );

    y += 25;

    doc.setDrawColor(220, 229, 222);
    doc.line(margin, y, pageWidth - margin, y);
    y += 9;

    addSectionTitle("Executive Summary");

    const cardGap = 4;
    const cardWidth = (contentWidth - cardGap * 3) / 4;

    addMetricCard(
      margin,
      y,
      cardWidth,
      "TOTAL RECORDS",
      getNumber(summary.totalRecords),
      "Across selected modules"
    );

    addMetricCard(
      margin + cardWidth + cardGap,
      y,
      cardWidth,
      "COMPLETED PROJECTS",
      getNumber(summary.completedProjects),
      `${getNumber(summary.projects)} total projects`
    );

    addMetricCard(
      margin + (cardWidth + cardGap) * 2,
      y,
      cardWidth,
      "COMPLETION RATE",
      `${getNumber(summary.completionRate)}%`,
      "Reported project completion"
    );

    addMetricCard(
      margin + (cardWidth + cardGap) * 3,
      y,
      cardWidth,
      "EVENTS RECORDED",
      getNumber(summary.events),
      "Matching event records"
    );

    y += 30;

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Additional Metric", "Value", "Additional Metric", "Value"]],
      body: [
        [
          "Ongoing Projects",
          String(getNumber(summary.ongoingProjects)),
          "Planned Projects",
          String(getNumber(summary.plannedProjects)),
        ],
        [
          "Knowledge Resources",
          String(getNumber(summary.knowledgeResources)),
          "AI Classifications",
          String(getNumber(summary.aiClassifications)),
        ],
        [
          "Records in Detail",
          String(records.length),
          "Included Modules",
          selectedModules || "None",
        ],
      ],
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [50, 58, 52],
      },
      headStyles: {
        fillColor: green,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 248],
      },
    });

    y = doc.lastAutoTable.finalY + 9;

    addSectionTitle("SDG Coverage Overview");

    const chartData = distribution
      .map((item) => ({
        label: item.sdg || "Not assigned",
        total: getNumber(item.total),
        projects: getNumber(item.projects),
        events: getNumber(item.events),
        knowledgeResources: getNumber(item.knowledgeResources),
      }))
      .filter((item) => item.total >= 0);

    const labelWidth = 31;
    const valueWidth = 13;
    const barX = margin + labelWidth;
    const barWidth = contentWidth - labelWidth - valueWidth - 3;
    const rowHeight = 5.1;
    const chartHeight = Math.max(chartData.length, 1) * rowHeight + 13;

    checkPageSpace(chartHeight + 13);

    const actualChartTop = y;
    const maxValue = Math.max(
      1,
      ...chartData.map((item) => item.total)
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...muted);

    doc.text("SDG", margin, y + 2);
    doc.text("Total records", barX, y + 2);
    doc.text("Count", pageWidth - margin, y + 2, {
      align: "right",
    });

    y += 6;

    if (chartData.length === 0) {
      doc.setFontSize(9);
      doc.setTextColor(...muted);
      doc.text(
        "No SDG coverage data is available for these filters.",
        margin,
        y + 5
      );
      y += 13;
    } else {
      chartData.forEach((item) => {
        checkPageSpace(rowHeight + 2);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(45, 55, 48);
        doc.text(item.label, margin, y + 3.3);

        doc.setFillColor(239, 243, 239);
        doc.roundedRect(barX, y, barWidth, 3.6, 1, 1, "F");

        const currentBarWidth = (item.total / maxValue) * barWidth;

        if (currentBarWidth > 0) {
          doc.setFillColor(...green);
          doc.roundedRect(
            barX,
            y,
            Math.max(0.8, currentBarWidth),
            3.6,
            1,
            1,
            "F"
          );
        }

        doc.setTextColor(45, 55, 48);
        doc.setFont("helvetica", "bold");
        doc.text(
          String(item.total),
          pageWidth - margin,
          y + 3.2,
          { align: "right" }
        );

        y += rowHeight;
      });

      doc.setFont("helvetica", "italic");
      doc.setFontSize(7);
      doc.setTextColor(...muted);
      doc.text(
        "Bar lengths represent the relative number of records per SDG.",
        margin,
        y + 1
      );

      y += 7;
    }

    y = Math.max(y, actualChartTop + chartHeight);
    y += 3;

    addSectionTitle("SDG Coverage Details");

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [[
        "SDG",
        "Projects",
        "Events",
        "Knowledge Resources",
        "Total Records",
      ]],
      body: distribution.length
        ? distribution.map((item) => [
            item.sdg || "Not assigned",
            String(getNumber(item.projects)),
            String(getNumber(item.events)),
            String(getNumber(item.knowledgeResources)),
            String(getNumber(item.total)),
          ])
        : [["No data available", "0", "0", "0", "0"]],
      theme: "striped",
      styles: {
        fontSize: 8,
        cellPadding: 2.5,
        textColor: [50, 58, 52],
      },
      headStyles: {
        fillColor: green,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 250, 248],
      },
    });

    y = doc.lastAutoTable.finalY + 9;

    addSectionTitle("Project Status Summary");

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Project Status", "Number of Projects"]],
      body: [
        ["Completed", String(getNumber(summary.completedProjects))],
        ["Ongoing", String(getNumber(summary.ongoingProjects))],
        ["Planned", String(getNumber(summary.plannedProjects))],
        ["Total Projects", String(getNumber(summary.projects))],
      ],
      theme: "grid",
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: green,
        textColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 85 },
        1: { cellWidth: 45, halign: "center" },
      },
    });

    y = doc.lastAutoTable.finalY + 9;

    addSectionTitle("Admin Recommendations");

    const recommendationText =
      adminRecommendations.trim() ||
      "No admin recommendations have been entered.";

    const recommendationParagraphs = recommendationText.split(/\r?\n/);

    recommendationParagraphs.forEach((paragraph) => {
      const lines = doc.splitTextToSize(
        paragraph || " ",
        contentWidth - 6
      );

      lines.forEach((line) => {
        checkPageSpace(6);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(50, 58, 52);
        doc.text(line, margin + 3, y);

        y += 4.5;
      });

      y += 1.5;
    });

    y += 5;

    addSectionTitle("Included Records");

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [[
        "Module",
        "Record",
        "SDG",
        "Barangay",
        "Status",
        "Date",
      ]],
      body: records.length
        ? records.map((record) => [
            record.reportModule || "—",
            getRecordTitle(record),
            getRecordSDG(record),
            record.barangay || "—",
            record.status || "Recorded",
            formatDate(record.createdAt || record.date),
          ])
        : [["—", "No matching records", "—", "—", "—", "—"]],
      theme: "striped",
      styles: {
        fontSize: 7.5,
        cellPadding: 2.5,
        overflow: "linebreak",
        valign: "top",
      },
      headStyles: {
        fillColor: green,
        textColor: [255, 255, 255],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 248],
      },
      columnStyles: {
        0: { cellWidth: 27 },
        1: { cellWidth: 65 },
        2: { cellWidth: 40 },
        3: { cellWidth: 38 },
        4: { cellWidth: 35 },
        5: { cellWidth: 30 },
      },
    });

    if (report.limitations?.length) {
      y = doc.lastAutoTable.finalY + 9;
      checkPageSpace(20);

      addSectionTitle("Data Limitations and Interpretation");

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        body: report.limitations.map((item) => [String(item)]),
        theme: "plain",
        styles: {
          fontSize: 8,
          cellPadding: 2.5,
          overflow: "linebreak",
          textColor: [60, 68, 62],
        },
      });
    }

    addFooter();

    const dateStamp = new Date().toISOString().slice(0, 10);

    doc.save(`SDG-Smart-Hub-Completion-Report-${dateStamp}.pdf`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <div className={styles.eyebrow}>ADMIN PANEL / REPORTING</div>
          <h1>Completion Reports</h1>
          <p>
            Compile saved records across SDG Smart Hub into one
            reporting view.
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
              Confirm that the backend route is registered and the server
              is running.
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
              <h2>Consolidated Completion Report</h2>
              <p>Generated {generatedAt}</p>
            </div>
          </section>

          <section className={styles.summaryGrid}>
            <article className={styles.summaryCard}>
              <span>Total records</span>
              <strong>{summary.totalRecords ?? 0}</strong>
              <small>Across selected modules</small>
            </article>

            <article className={styles.summaryCard}>
              <span>Projects completed</span>
              <strong>{summary.completedProjects ?? 0}</strong>
              <small>{summary.projects ?? 0} project records</small>
            </article>

            <article className={styles.summaryCard}>
              <span>Project completion rate</span>
              <strong>{summary.completionRate ?? 0}%</strong>
              <small>Completed / total projects</small>
            </article>

            <article className={styles.summaryCard}>
              <span>Events recorded</span>
              <strong>{summary.events ?? 0}</strong>
              <small>Matching event records</small>
            </article>
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
                <h2>
                  <ChartNoAxesCombined size={19} />
                  SDG coverage
                </h2>
                <p>
                  Counts of matching projects, events, and knowledge
                  resources by SDG.
                </p>
              </div>
            </div>

            <div className={styles.tableWrap}>
              <table>
                <thead>
                  <tr>
                    <th>SDG</th>
                    <th>Projects</th>
                    <th>Events</th>
                    <th>Knowledge resources</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {distribution.map((item) => (
                    <tr key={item.sdg}>
                      <td>{item.sdg}</td>
                      <td>{item.projects}</td>
                      <td>{item.events}</td>
                      <td>{item.knowledgeResources}</td>
                      <td>
                        <strong>{item.total}</strong>
                      </td>
                    </tr>
                  ))}

                  {distribution.length === 0 && (
                    <tr>
                      <td colSpan="5" className={styles.emptyCell}>
                        No SDG distribution data available.
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
                  separately for the current filters and included in the
                  exported PDF.
                </p>
              </div>
            </div>

            <textarea
              value={adminRecommendations}
              onChange={(event) =>
                setAdminRecommendations(event.target.value)
              }
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
                {savingRecommendations
                  ? "Saving..."
                  : "Save Recommendations"}
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
                <h2>Included records</h2>
                <p>
                  {records.length} records match the current filters.
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
                  {records.map((record, index) => (
                    <tr
                      key={
                        record._id ||
                        `${record.reportModule}-${index}`
                      }
                    >
                      <td>{record.reportModule}</td>
                      <td className={styles.recordTitle}>
                        {getRecordTitle(record)}
                      </td>
                      <td>{getRecordSDG(record)}</td>
                      <td>{record.barangay || "—"}</td>
                      <td>{record.status || "Recorded"}</td>
                      <td>
                        {formatDate(record.createdAt || record.date)}
                      </td>
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
            <span>SDG SMART HUB · COMPLETION REPORT</span>
            <span>Generated from records available in the system.</span>
          </footer>
        </div>
      )}
    </div>
  );
}

export default CompletionReports;