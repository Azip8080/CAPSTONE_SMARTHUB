
import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import styles from "./AuditLogs.module.css";

const ACTION_OPTIONS = [
  "LOGIN",
  "LOGOUT",
  "PROJECT_SUBMITTED",
  "EVENT_SUBMITTED",
  "PROJECT_APPROVED",
  "PROJECT_REJECTED",
  "EVENT_APPROVED",
  "EVENT_REJECTED",
  "PROJECT_UPDATED",
  "EVENT_UPDATED",
  "PROJECT_DELETED",
  "EVENT_DELETED",
  "USER_CREATED",
  "USER_ACTIVATED",
  "USER_REJECTED",
  "USER_UPDATED",
  "USER_DELETED",
];

function formatAction(action = "") {
  return action
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    limit: 20,
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });

      if (search.trim()) params.set("search", search.trim());
      if (actionFilter !== "all") params.set("action", actionFilter);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (fromDate) params.set("from", fromDate);
      if (toDate) params.set("to", toDate);

      const response = await api.get(
        `/audit-logs?${params.toString()}`
      );

      setLogs(response.logs || []);
      setPagination((current) => ({
        ...current,
        total: response.total || 0,
        pages: Math.max(1, response.pages || 1),
        limit: response.limit || current.limit,
      }));
    } catch (err) {
      setError(err.message || "Failed to load audit logs.");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    pagination.limit,
    search,
    actionFilter,
    roleFilter,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterChange = (setter, value) => {
    setter(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setActionFilter("all");
    setRoleFilter("all");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const loginCount = logs.filter(
    (log) => log.action === "LOGIN"
  ).length;

  const submissionCount = logs.filter((log) =>
    ["PROJECT_SUBMITTED", "EVENT_SUBMITTED"].includes(log.action)
  ).length;

  const reviewCount = logs.filter((log) =>
    [
      "PROJECT_APPROVED",
      "PROJECT_REJECTED",
      "EVENT_APPROVED",
      "EVENT_REJECTED",
    ].includes(log.action)
  ).length;

  return (
    <div className={styles.auditLogs}>
      <header className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Audit Logs</h1>
          <p className={styles.pageSubtitle}>
            Monitor user activities and administrative actions across SDG Smart Hub.
          </p>
        </div>

        <button
          type="button"
          className={styles.refreshBtn}
          onClick={fetchLogs}
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh Logs"}
        </button>
      </header>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Total Activities</span>
          <strong className={styles.summaryValue}>
            {pagination.total}
          </strong>
          <span className={styles.summaryDescription}>
            Matching audit records
          </span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Logins</span>
          <strong className={styles.summaryValue}>
            {loginCount}
          </strong>
          <span className={styles.summaryDescription}>
            On this page
          </span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Submissions</span>
          <strong className={styles.summaryValue}>
            {submissionCount}
          </strong>
          <span className={styles.summaryDescription}>
            On this page
          </span>
        </div>

        <div className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Review Actions</span>
          <strong className={styles.summaryValue}>
            {reviewCount}
          </strong>
          <span className={styles.summaryDescription}>
            On this page
          </span>
        </div>
      </div>

      <section className={styles.filterSection}>
        <div className={styles.filterHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Activity History</h2>
            <p className={styles.sectionDescription}>
              Search and filter recorded system activities.
            </p>
          </div>

          <button
            type="button"
            className={styles.clearBtn}
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchField}>
            <label htmlFor="audit-search">Search activities</label>
            <input
              id="audit-search"
              type="search"
              placeholder="Search name, email, description..."
              value={search}
              onChange={(event) =>
                handleFilterChange(setSearch, event.target.value)
              }
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="audit-action">Action</label>
            <select
              id="audit-action"
              value={actionFilter}
              onChange={(event) =>
                handleFilterChange(setActionFilter, event.target.value)
              }
            >
              <option value="all">All Actions</option>
              {ACTION_OPTIONS.map((action) => (
                <option key={action} value={action}>
                  {formatAction(action)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="audit-role">User Role</label>
            <select
              id="audit-role"
              value={roleFilter}
              onChange={(event) =>
                handleFilterChange(setRoleFilter, event.target.value)
              }
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="barangay_personnel">Barangay Personnel</option>
              <option value="community_member">Community Member</option>
            </select>
          </div>

          <div className={styles.filterField}>
            <label htmlFor="audit-from">From</label>
            <input
              id="audit-from"
              type="date"
              value={fromDate}
              onChange={(event) =>
                handleFilterChange(setFromDate, event.target.value)
              }
            />
          </div>

          <div className={styles.filterField}>
            <label htmlFor="audit-to">To</label>
            <input
              id="audit-to"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) =>
                handleFilterChange(setToDate, event.target.value)
              }
            />
          </div>
        </div>
      </section>

      {error && (
        <div className={styles.errorMessage} role="alert">
          {error}
        </div>
      )}

      <section className={styles.tableSection}>
        <div className={styles.tableWrapper}>
          <table className={styles.auditTable}>
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>User</th>
                <th>Role</th>
                <th>Barangay</th>
                <th>Action</th>
                <th>Description</th>
                <th>Remarks</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className={styles.emptyState}>
                    Loading audit logs...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="7" className={styles.emptyState}>
                    No audit records found.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id}>
                    <td className={styles.dateCell}>
                      {formatDate(log.createdAt)}
                    </td>
                    <td>
                      <div className={styles.userCell}>
                        <strong>{log.userName || "Unknown User"}</strong>
                        <span>{log.userEmail || "—"}</span>
                      </div>
                    </td>
                    <td>
                      {formatAction(log.userRole || "unknown")}
                    </td>
                    <td>{log.barangay || "—"}</td>
                    <td>
                      <span className={styles.actionBadge}>
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td className={styles.descriptionCell}>
                      {log.description || "—"}
                    </td>
                    <td className={styles.remarksCell}>
                      {log.remarks || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className={styles.pagination}>
          <span className={styles.paginationInfo}>
            Showing {logs.length} of {pagination.total} records
          </span>

          <div className={styles.paginationControls}>
            <button
              type="button"
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              disabled={page <= 1 || loading}
            >
              Previous
            </button>

            <span>
              Page {page} of {pagination.pages}
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(pagination.pages, current + 1)
                )
              }
              disabled={page >= pagination.pages || loading}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default AuditLogs;
