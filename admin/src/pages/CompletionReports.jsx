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

  const exportPDF = () => {
    if (!report) return;

    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;
    const contentWidth = pageWidth - margin * 2;
    const green = [27, 77, 62];
    const lightGreen = [231, 241, 235];
    const muted = [95, 108, 101];

    const addSectionTitle = (title, y) => {
      doc.setFillColor(...lightGreen);
      doc.roundedRect(margin, y, contentWidth, 9, 1.5, 1.5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(...green);
      doc.text(title, margin + 3, y + 6);
      return y + 13;
    };

    const addFooter = () => {
      const pageCount = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.getHeight();

      for (let page = 1; page <= pageCount; page++) {
        doc.setPage(page);
        doc.setDrawColor(220, 229, 222);
        doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(7.5);
        doc.setTextColor(...muted);
        doc.text(
          "SDG SMART HUB | PROJECT AND EVENT REPORT",
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

    const projectRecords = records.filter((record) =>
      String(record.reportModule || "").toLowerCase().includes("project")
    );

    const getStatusCount = (items, status) =>
      items.filter((item) => normalizeStatus(item.status) === status).length;

    const projectTotal =
      projectRecords.length || getNumber(summary.projects);

    const projectCompleted =
      projectRecords.length > 0
        ? getStatusCount(projectRecords, "Completed")
        : getNumber(summary.completedProjects);

    const projectOngoing =
      projectRecords.length > 0
        ? getStatusCount(projectRecords, "Ongoing")
        : getNumber(summary.ongoingProjects);

    const projectPlanned =
      projectRecords.length > 0
        ? getStatusCount(projectRecords, "Planned")
        : getNumber(summary.plannedProjects);

    const selectedModules = MODULE_OPTIONS.filter((item) =>
      modules.includes(item.id)
    )
      .map((item) => item.label)
      .join(", ");

    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 18;

    doc.setFillColor(...green);
    doc.rect(0, 0, pageWidth, 4, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(21);
    doc.setTextColor(...green);
    doc.text("SDG SMART HUB", margin, y);

    doc.setFontSize(14);
    doc.setTextColor(45, 55, 48);
    doc.text("Project and Event Completion Report", margin, y + 8);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...muted);
    doc.text(`Generated: ${generatedAt}`, margin, y + 14);

    doc.text(
      `Period: ${from || "All dates"} to ${to || "Present"}`,
      pageWidth - margin,
      y,
      { align: "right" }
    );

    doc.text(
      `SDG: ${sdg || "All SDGs"} | Community: ${barangay.trim() || "All barangays"}`,
      pageWidth - margin,
      y + 6,
      { align: "right" }
    );

    doc.text(
      `Modules: ${selectedModules || "None"}`,
      pageWidth - margin,
      y + 12,
      { align: "right" }
    );

    y += 23;
    doc.setDrawColor(220, 229, 222);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    y = addSectionTitle("Project Summary", y);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [["Total Projects", "Completed", "Ongoing", "Planned"]],
      body: [[
        String(projectTotal),
        String(projectCompleted),
        String(projectOngoing),
        String(projectPlanned),
      ]],
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 5,
        halign: "center",
        textColor: [50, 58, 52],
      },
      headStyles: {
        fillColor: green,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
    });

    y = doc.lastAutoTable.finalY + 9;

    if (y + 25 > pageHeight - 16) {
      doc.addPage();
      y = 18;
    }

    y = addSectionTitle(
      "Project Showcase: Uploaded Documents and Status",
      y
    );

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin, bottom: 18 },
      head: [[
        "Project Title",
        "Uploaded Document",
        "Status",
        "SDG",
        "Barangay",
        "Date",
      ]],
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
      alternateRowStyles: {
        fillColor: [248, 250, 248],
      },
      columnStyles: {
        0: { cellWidth: 52 },
        1: { cellWidth: 65 },
        2: { cellWidth: 28 },
        3: { cellWidth: 37 },
        4: { cellWidth: 40 },
        5: { cellWidth: 28 },
      },
    });

    addFooter();

    const dateStamp = new Date().toISOString().slice(0, 10);
    doc.save(`SDG-Smart-Hub-Project-Event-Report-${dateStamp}.pdf`);
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