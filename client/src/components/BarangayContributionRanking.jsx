
import { useEffect, useState } from "react";
import styles from "./BarangayContributionRanking.module.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const API_BASE = `${API_URL}/api`;
const TOKEN_KEY = "token";

function getAuthHeaders() {
  const token = localStorage.getItem(TOKEN_KEY);

  return {
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok || result.success === false) {
    throw new Error(
      result.message || `Request failed with status ${response.status}.`
    );
  }

  return result;
}

function BarangayContributionRanking() {
  const [barangays, setBarangays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [publishedProjects, setPublishedProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchBarangayContributions() {
      try {
        setLoading(true);
        setError("");

        const result = await apiRequest(
          `${API_BASE}/projects/barangay-ranking`,
          { signal: controller.signal }
        );

        const data = Array.isArray(result.data) ? result.data : [];

        data.sort(
          (a, b) =>
            (Number(b.projectCount) || 0) -
            (Number(a.projectCount) || 0)
        );

        setBarangays(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Barangay contributions error:", err);
          setError(err.message || "Unable to load barangay contributions.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchBarangayContributions();

    return () => controller.abort();
  }, []);

  async function handleOpenProjects(barangay) {
    if (!barangay) return;

    setSelectedBarangay(barangay);
    setPublishedProjects([]);
    setProjectsError("");

    const token = localStorage.getItem(TOKEN_KEY);

    if (!token) {
      setProjectsError("Please log in to view published project details.");
      return;
    }

    setProjectsLoading(true);

    try {
      const result = await apiRequest(
        `${API_BASE}/projects/barangay/${encodeURIComponent(
          barangay
        )}/published`
      );

      setPublishedProjects(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      console.error("Published projects error:", err);
      setProjectsError(
        err.message || "Unable to load published projects."
      );
    } finally {
      setProjectsLoading(false);
    }
  }

  function closeProjects() {
    setSelectedBarangay("");
    setPublishedProjects([]);
    setProjectsError("");
    setProjectsLoading(false);
  }

  function getProjectTitle(project) {
    return (
      project.title ||
      project.projectTitle ||
      "Untitled Project"
    );
  }

  function formatDate(date) {
    if (!date) return "Date not available";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Date not available";
    }

    return parsedDate.toLocaleDateString("en-PH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getBarangaySdgs(project) {
    const tags = Array.isArray(project.sdgTags)
      ? project.sdgTags
      : [];

    const alternateTags = Array.isArray(project.sdgs)
      ? project.sdgs
      : [];

    const singleTag = project.sdgTag
      ? Array.isArray(project.sdgTag)
        ? project.sdgTag
        : [project.sdgTag]
      : [];

    return [
      ...new Set(
        [...tags, ...alternateTags, ...singleTag]
          .filter((tag) => tag !== null && tag !== undefined)
          .map((tag) => String(tag).trim())
          .filter(Boolean)
      ),
    ];
  }

  function formatSdg(sdg) {
    const value = String(sdg).trim();

    return /^sdg\s*/i.test(value)
      ? value.replace(/^sdg\s*/i, "SDG ")
      : `SDG ${value}`;
  }

  const maxProjects = Math.max(
    1,
    ...barangays.map((item) => Number(item.projectCount) || 0)
  );

  return (
    <>
      <section className={styles.section}>
        <div className={styles.heading}>
          <div className={styles.headingIcon} aria-hidden="true">
            <span>⌂</span>
          </div>

          <div className={styles.headingText}>
            <span className={styles.eyebrow}>
              COMMUNITY CONTRIBUTIONS
            </span>

            <h2>Barangay SDG Contributions</h2>

            <p>
              Explore published projects and the SDGs represented
              by each barangay.
            </p>
          </div>

          <span className={styles.totalBadge}>
            {loading ? "Loading..." : `${barangays.length} barangays`}
          </span>
        </div>

        {loading ? (
          <div className={styles.state} role="status">
            <span className={styles.loader} />
            <p>Loading barangay contributions...</p>
          </div>
        ) : error ? (
          <div className={styles.state} role="alert">
            <span className={styles.stateIcon}>!</span>
            <div>
              <h3>Unable to load contributions</h3>
              <p>{error}</p>
              <button
                type="button"
                className={styles.viewButton}
                onClick={() => window.location.reload()}
              >
                Reload page
              </button>
            </div>
          </div>
        ) : barangays.length === 0 ? (
          <div className={styles.state}>
            <span className={styles.stateIcon}>—</span>
            <div>
              <h3>No barangay project data yet</h3>
              <p>
                Contributions will appear when published projects
                with barangay information are available.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.chart}>
            {barangays.map((item, index) => {
              const projectCount = Number(item.projectCount) || 0;
              const percentage = Math.max(
                (projectCount / maxProjects) * 100,
                projectCount > 0 ? 4 : 0
              );

              return (
                <article
                  className={styles.barangayItem}
                  key={item.barangay || index}
                >
                  <div className={styles.barHeader}>
                    <div className={styles.barangayInfo}>
                      <h3>
                        {item.barangay || "Unnamed Barangay"}
                      </h3>

                      <span>
                        {projectCount}{" "}
                        {projectCount === 1
                          ? "published project"
                          : "published projects"}
                      </span>
                    </div>

                    <strong className={styles.projectCount}>
                      {projectCount}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className={styles.barTrackButton}
                    onClick={() => handleOpenProjects(item.barangay)}
                    aria-label={`View published projects for ${
                      item.barangay || "unnamed barangay"
                    }`}
                    title="View published projects"
                    disabled={!item.barangay}
                  >
                    <span
                      className={styles.barFill}
                      style={{ width: `${percentage}%` }}
                    />
                  </button>

                  <button
                    type="button"
                    className={styles.viewButton}
                    onClick={() => handleOpenProjects(item.barangay)}
                    disabled={!item.barangay}
                  >
                    View projects
                    <span aria-hidden="true">→</span>
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.footerDot} />
          <span>
            Project totals are based on published project records.
          </span>
        </div>
      </section>

      {selectedBarangay && (
        <div
          className={styles.overlay}
          onClick={closeProjects}
        >
          <section
            className={styles.projectPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="published-projects-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.panelHeader}>
              <div>
                <span className={styles.eyebrow}>
                  BARANGAY DETAILS
                </span>

                <h2 id="published-projects-title">
                  Published Projects
                </h2>

                <p>{selectedBarangay}</p>
              </div>

              <button
                type="button"
                className={styles.closeButton}
                onClick={closeProjects}
                aria-label="Close published projects"
              >
                ×
              </button>
            </div>

            {projectsLoading ? (
              <div className={styles.panelState} role="status">
                <span className={styles.loader} />
                <p>Loading published projects...</p>
              </div>
            ) : projectsError ? (
              <div className={styles.panelState} role="alert">
                <h3>Unable to load projects</h3>
                <p>{projectsError}</p>
              </div>
            ) : publishedProjects.length === 0 ? (
              <div className={styles.panelState}>
                <h3>No published projects found</h3>
                <p>
                  This barangay has no published projects available
                  to display.
                </p>
              </div>
            ) : (
              <div className={styles.projectList}>
                {publishedProjects.map((project, index) => {
                  const sdgs = getBarangaySdgs(project);

                  return (
                    <article
                      className={styles.projectCard}
                      key={project._id || project.id || index}
                    >
                      <div
                        className={styles.projectIcon}
                        aria-hidden="true"
                      >
                        SDG
                      </div>

                      <div className={styles.projectInfo}>
                        <h3>{getProjectTitle(project)}</h3>

                        <div className={styles.sdgTags}>
                          {sdgs.length > 0 ? (
                            sdgs.map((sdg, sdgIndex) => (
                              <span
                                className={styles.sdgTag}
                                key={`${sdg}-${sdgIndex}`}
                              >
                                {formatSdg(sdg)}
                              </span>
                            ))
                          ) : (
                            <span className={styles.sdgTag}>
                              SDG not specified
                            </span>
                          )}
                        </div>

                        {project.description && (
                          <p className={styles.projectDescription}>
                            {project.description}
                          </p>
                        )}

                        <span className={styles.projectDate}>
                          Published: {formatDate(project.publishedAt)}
                        </span>
                      </div>

                      <span className={styles.publishedBadge}>
                        Published
                      </span>
                    </article>
                  );
                })}
              </div>
            )}

            {!projectsLoading && !projectsError && (
              <div className={styles.panelFooter}>
                {publishedProjects.length} published{" "}
                {publishedProjects.length === 1
                  ? "project"
                  : "projects"}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default BarangayContributionRanking;
