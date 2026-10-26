
import { useMemo, useState } from "react";
import styles from "./ProjectStatus.module.css";

const STATUS_DATA = [
  { key: "Planned", color: "#64748b" },
  { key: "Ongoing", color: "#10b981" },
  { key: "Completed", color: "#3b82f6" },
];

function getSdgLabel(project) {
  const tags = Array.isArray(project.sdgTags)
    ? project.sdgTags
    : [];

  if (tags.length > 0) {
    return tags
      .map((tag) => {
        if (typeof tag === "string") return tag;
        return tag?.label || tag?.name || tag?.title || "";
      })
      .filter(Boolean)
      .join(", ");
  }

  return project.sdgTag || "No SDG tag";
}

function ProjectStatus({
  projects = [],
  isAdmin = false,
  token = "",
  onProjectsUpdated,
}) {
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [search, setSearch] = useState("");
  const [barangayFilter, setBarangayFilter] = useState("All");
  const [sdgFilter, setSdgFilter] = useState("All");

  const [editingProject, setEditingProject] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const safeProjects = Array.isArray(projects) ? projects : [];

  const statusData = useMemo(
    () =>
      STATUS_DATA.map((status) => ({
        ...status,
        projects: safeProjects.filter(
          (project) => project.status === status.key
        ),
      })),
    [safeProjects]
  );

  const totalProjects = safeProjects.length;

  const barangays = useMemo(
    () =>
      [...new Set(
        safeProjects
          .map((project) => project.barangay?.trim())
          .filter(Boolean)
      )].sort((a, b) => a.localeCompare(b)),
    [safeProjects]
  );

  const sdgOptions = useMemo(() => {
    const tags = safeProjects.flatMap((project) => {
      const label = getSdgLabel(project);
      return label === "No SDG tag" ? [] : label.split(", ");
    });

    return [...new Set(tags)].sort((a, b) => a.localeCompare(b));
  }, [safeProjects]);

  const selected = statusData.find(
    (status) => status.key === selectedStatus
  );

  const filteredProjects = useMemo(() => {
    if (!selected) return [];

    return selected.projects.filter((project) => {
      const query = search.trim().toLowerCase();
      const title = (project.title || "").toLowerCase();
      const barangay = (project.barangay || "").toLowerCase();
      const sdgLabel = getSdgLabel(project).toLowerCase();

      const matchesSearch =
        !query ||
        title.includes(query) ||
        barangay.includes(query) ||
        sdgLabel.includes(query);

      const matchesBarangay =
        barangayFilter === "All" ||
        project.barangay === barangayFilter;

      const matchesSdg =
        sdgFilter === "All" ||
        getSdgLabel(project)
          .split(", ")
          .includes(sdgFilter);

      return matchesSearch && matchesBarangay && matchesSdg;
    });
  }, [selected, search, barangayFilter, sdgFilter]);

  function openEditor(project) {
    if (!isAdmin) return;

    setEditingProject(project);
    setNewStatus(project.status || "Planned");
    setStatusNote("");
    setError("");
    setSuccess("");
  }

  function closeEditor() {
    if (saving) return;

    setEditingProject(null);
    setNewStatus("");
    setStatusNote("");
    setError("");
  }

  async function handleStatusUpdate(event) {
    event.preventDefault();

    if (!isAdmin || !editingProject) {
      setError("You are not authorized to update project status.");
      return;
    }

    if (!token) {
      setError(
        "Authentication token is missing. Please sign in again."
      );
      return;
    }

    if (!STATUS_DATA.some((status) => status.key === newStatus)) {
      setError("Please select a valid project status.");
      return;
    }

    if (newStatus === editingProject.status) {
      closeEditor();
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:5000/api/projects/${encodeURIComponent(
          editingProject._id
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            statusNote: statusNote.trim(),
          }),
        }
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || "Failed to update project status."
        );
      }

      setSuccess(
        `"${editingProject.title}" status updated to ${newStatus}.`
      );

      setEditingProject(null);

      if (typeof onProjectsUpdated === "function") {
        await onProjectsUpdated(result.data);
      }
    } catch (err) {
      setError(
        err.message || "An error occurred while updating the status."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <p className={styles.title}>Project Status</p>
          <p className={styles.subtitle}>
            Monitor and manage community project progress
          </p>
        </div>

        <div className={styles.total}>
          <strong>{totalProjects}</strong>
          <span>Total projects</span>
        </div>
      </header>

      {success && (
        <div className={styles.successMessage} role="status">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss success message"
          >
            ×
          </button>
        </div>
      )}

      <div className={styles.statusGrid}>
        {statusData.map((status) => {
          const count = status.projects.length;
          const percentage =
            totalProjects > 0
              ? Math.round((count / totalProjects) * 100)
              : 0;

          const active = selectedStatus === status.key;

          return (
            <button
              key={status.key}
              type="button"
              className={`${styles.statusCard} ${
                active ? styles.selected : ""
              }`}
              onClick={() => {
                setSelectedStatus(active ? null : status.key);
                setSearch("");
                setBarangayFilter("All");
                setSdgFilter("All");
                setError("");
              }}
              aria-pressed={active}
            >
              <div className={styles.statusTop}>
                <span
                  className={styles.statusDot}
                  style={{ backgroundColor: status.color }}
                />
                <span className={styles.statusLabel}>
                  {status.key}
                </span>
                <span className={styles.openIndicator}>
                  {active ? "−" : "+"}
                </span>
              </div>

              <strong className={styles.statusCount}>{count}</strong>

              <div className={styles.progressTrack}>
                <div
                  className={styles.progressBar}
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: status.color,
                  }}
                />
              </div>

              <span className={styles.statusPercentage}>
                {percentage}% of all projects
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className={styles.details}>
          <div className={styles.detailsHeader}>
            <div>
              <h3 className={styles.detailsTitle}>
                {selected.key} Projects
              </h3>
              <p className={styles.detailsSubtitle}>
                {filteredProjects.length} matching{" "}
                {filteredProjects.length === 1 ? "project" : "projects"}
              </p>
            </div>

            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setSelectedStatus(null);
                setSearch("");
                setBarangayFilter("All");
                setSdgFilter("All");
                setError("");
              }}
            >
              Close list
            </button>
          </div>

          <div className={styles.filters}>
            <label className={styles.searchBox}>
              <span className={styles.srOnly}>Search projects</span>
              <span aria-hidden="true">⌕</span>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, barangay, or SDG..."
              />
            </label>

            <label className={styles.filterControl}>
              <span className={styles.srOnly}>Filter by barangay</span>
              <select
                value={barangayFilter}
                onChange={(event) =>
                  setBarangayFilter(event.target.value)
                }
              >
                <option value="All">All barangays</option>
                {barangays.map((barangay) => (
                  <option key={barangay} value={barangay}>
                    {barangay}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.filterControl}>
              <span className={styles.srOnly}>Filter by SDG</span>
              <select
                value={sdgFilter}
                onChange={(event) => setSdgFilter(event.target.value)}
              >
                <option value="All">All SDGs</option>
                {sdgOptions.map((sdg) => (
                  <option key={sdg} value={sdg}>
                    {sdg}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {error && !editingProject && (
            <p className={styles.errorMessage} role="alert">
              {error}
            </p>
          )}

          {filteredProjects.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true">
                <icon name="folder-search" size="xl" />
              </span>
              <strong>No matching projects</strong>
              <p>Try another search term or change your filters.</p>
            </div>
          ) : (
            <div className={styles.projectList}>
              {filteredProjects.map((project) => (
                <article
                  key={project._id}
                  className={styles.project}
                >
                  <div className={styles.projectInfo}>
                    <h4 className={styles.projectTitle}>
                      {project.title || "Untitled project"}
                    </h4>

                    <p className={styles.projectSub}>
                      {project.barangay || "Barangay not specified"}
                      <span aria-hidden="true"> · </span>
                      {getSdgLabel(project)}
                    </p>

                    {project.description && (
                      <p className={styles.projectDescription}>
                        {project.description}
                      </p>
                    )}
                  </div>

                  <div className={styles.projectActions}>
                    <span
                      className={styles.projectStatus}
                      style={{
                        color: selected.color,
                        backgroundColor: `${selected.color}15`,
                      }}
                    >
                      {project.status || "Unspecified"}
                    </span>

                    {isAdmin && (
                      <button
                        type="button"
                        className={styles.updateButton}
                        onClick={() => openEditor(project)}
                      >
                        Update status
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}

          {isAdmin && (
            <p className={styles.adminHint}>
              Status changes are saved to the project record.
            </p>
          )}
        </div>
      )}

      {editingProject && (
        <div
          className={styles.modalBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor();
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="status-modal-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <h3 id="status-modal-title">Update project status</h3>
                <p>{editingProject.title}</p>
              </div>

              <button
                type="button"
                className={styles.modalClose}
                onClick={closeEditor}
                disabled={saving}
                aria-label="Close dialog"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleStatusUpdate}>
              <label className={styles.formLabel}>
                New status
                <select
                  value={newStatus}
                  onChange={(event) => setNewStatus(event.target.value)}
                  disabled={saving}
                  required
                >
                  {STATUS_DATA.map((status) => (
                    <option key={status.key} value={status.key}>
                      {status.key}
                    </option>
                  ))}
                </select>
              </label>

              <label className={styles.formLabel}>
                Progress note (optional)
                <textarea
                  value={statusNote}
                  onChange={(event) => setStatusNote(event.target.value)}
                  placeholder="Add a brief explanation for this change..."
                  rows={3}
                  maxLength={500}
                  disabled={saving}
                />
              </label>

              {error && (
                <p className={styles.errorMessage} role="alert">
                  {error}
                </p>
              )}

              <p className={styles.confirmText}>
                Change status from{" "}
                <strong>{editingProject.status || "Unspecified"}</strong>{" "}
                to <strong>{newStatus}</strong>?
              </p>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={closeEditor}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.saveButton}
                  disabled={saving || newStatus === editingProject.status}
                >
                  {saving ? "Saving..." : "Confirm update"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </section>
  );
}

export default ProjectStatus;
