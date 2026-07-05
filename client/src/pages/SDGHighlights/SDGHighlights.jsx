import { useState, useEffect } from "react";
import styles from "./SDGHighlights.module.css";
import FeaturedProject from "./components/FeaturedProject";
import ProjectGrid from "./components/ProjectGrid";
import { fetchProjects } from "../../services/projectService";

const SDG_FILTERS = [
  "All", "SDG 1", "SDG 2", "SDG 3", "SDG 4", "SDG 5", "SDG 6",
  "SDG 7", "SDG 8", "SDG 9", "SDG 10", "SDG 11", "SDG 12",
  "SDG 13", "SDG 14", "SDG 15", "SDG 16", "SDG 17",
];

const STATUS_FILTERS = ["All", "Planned", "Ongoing", "Completed"];

function SDGHighlights() {
  const [projects, setProjects]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [sdgFilter, setSdgFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    setLoading(true);
    fetchProjects()
      .then(setProjects)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = projects.filter((p) => {
    const matchSDG    = sdgFilter === "All"    || p.sdgTag  === sdgFilter;
    const matchStatus = statusFilter === "All" || p.status  === statusFilter;
    return matchSDG && matchStatus;
  });

  const featured  = filtered[0] || null;
  const rest      = filtered.slice(1, visibleCount + 1);
  const hasMore   = filtered.length - 1 > visibleCount;

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>SDG Highlights</h1>
        <p className={styles.heroSubtitle}>
          Showcasing impactful sustainability projects from barangays across Manila.
        </p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarInner}>
          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Goal</span>
            <select
              className={styles.select}
              value={sdgFilter}
              onChange={(e) => { setSdgFilter(e.target.value); setVisibleCount(6); }}
            >
              {SDG_FILTERS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Status</span>
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setVisibleCount(6); }}
            >
              {STATUS_FILTERS.map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>

          <span className={styles.count}>
            {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      <div className={styles.content}>
        {loading && <p className={styles.status}>Loading projects…</p>}
        {error   && <p className={styles.statusError}>{error}</p>}

        {!loading && !error && filtered.length === 0 && (
          <p className={styles.status}>No projects found.</p>
        )}

        {!loading && !error && featured && (
          <>
            <FeaturedProject project={featured} />
            <ProjectGrid projects={rest} />
            {hasMore && (
              <div className={styles.moreRow}>
                <button
                  className={styles.moreBtn}
                  onClick={() => setVisibleCount((c) => c + 6)}
                >
                  View more projects
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

export default SDGHighlights;