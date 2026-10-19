
import { useEffect, useState } from "react";
import styles from "./BarangayContributionRanking.module.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const API_BASE = `${API_URL}/api`;

function BarangayContributionRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAll, setShowAll] = useState(false);

  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRanking() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE}/projects/barangay-ranking`,
          { signal: controller.signal }
        );

        const result = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(
            result.message ||
              `Unable to load barangay rankings (HTTP ${response.status}).`
          );
        }

        if (!result.success) {
          throw new Error(
            result.message || "Unable to load rankings."
          );
        }

        setRanking(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Barangay ranking error:", err);
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadRanking();

    return () => controller.abort();
  }, []);

  async function openProjects(barangay) {
    if (!barangay) return;

    setSelectedBarangay(barangay);
    setProjects([]);
    setProjectsError("");
    setProjectsLoading(true);

    try {
      const response = await fetch(
        `${API_BASE}/projects/barangay/${encodeURIComponent(
          barangay
        )}/published`
      );

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message ||
            `Unable to load published projects (HTTP ${response.status}).`
        );
      }

      if (!result.success) {
        throw new Error(
          result.message || "Unable to load published projects."
        );
      }

      setProjects(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      console.error("Published projects error:", err);
      setProjectsError(err.message || "Something went wrong.");
    } finally {
      setProjectsLoading(false);
    }
  }

  function closeProjects() {
    setSelectedBarangay("");
    setProjects([]);
    setProjectsError("");
    setProjectsLoading(false);
  }

  function projectTitle(project) {
    return project.title || project.projectTitle || "Untitled Project";
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

  const visibleRanking = showAll ? ranking : ranking.slice(0, 3);

  return (
    <>
      <section className={styles.section}>
        <div className={styles.heading}>
          <div className={styles.headingIcon} aria-hidden="true">
            <span>⌂</span>
          </div>

          <div className={styles.headingText}>
            <span className={styles.eyebrow}>COMMUNITY IMPACT</span>
            <h2>Top Contributing Barangays</h2>
            <p>
              Explore communities making a difference through SDG projects.
            </p>
          </div>

          <span className={styles.totalBadge}>
            {loading ? "Loading..." : `${ranking.length} ranked`}
          </span>
        </div>

        {loading ? (
          <div className={styles.state} role="status">
            <span className={styles.loader} />
            <p>Loading barangay rankings...</p>
          </div>
        ) : error ? (
          <div className={styles.state} role="alert">
            <h3>Unable to load rankings</h3>
            <p>{error}</p>
          </div>
        ) : ranking.length === 0 ? (
          <div className={styles.state}>
            <h3>No published projects yet</h3>
            <p>
              Barangay rankings will appear when published projects are
              available.
            </p>
          </div>
        ) : (
          <>
            <div className={styles.list}>
              {visibleRanking.map((item, index) => (
                <button
                  type="button"
                  className={styles.row}
                  key={item.barangay || index}
                  onClick={() => openProjects(item.barangay)}
                  aria-label={`View published projects for ${
                    item.barangay || "unnamed barangay"
                  }`}
                >
                  <span
                    className={`${styles.rank} ${
                      index < 3
                        ? styles[`rank${index + 1}`] || ""
                        : ""
                    }`}
                  >
                    {index + 1}
                  </span>

                  <span className={styles.barangayInfo}>
                    <span className={styles.barangayName}>
                      {item.barangay || "Unnamed Barangay"}
                    </span>

                    <span className={styles.projectCount}>
                      <strong>{item.projectCount ?? 0}</strong>{" "}
                      {(item.projectCount ?? 0) === 1
                        ? "published project"
                        : "published projects"}
                    </span>
                  </span>

                  <span className={styles.rowArrow} aria-hidden="true">
                    ›
                  </span>
                </button>
              ))}
            </div>

            {ranking.length > 3 && (
              <button
                type="button"
                className={styles.viewAllButton}
                onClick={() => setShowAll((current) => !current)}
                aria-expanded={showAll}
              >
                {showAll
                  ? "Show less"
                  : `View all ${ranking.length} barangays`}
                <span aria-hidden="true">
                  {showAll ? "↑" : "↓"}
                </span>
              </button>
            )}
          </>
        )}

        <div className={styles.footer}>
          Rankings are based on published project records.
        </div>
      </section>

      {selectedBarangay && (
        <div className={styles.overlay} onClick={closeProjects}>
          <section
            className={styles.projectPanel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="published-projects-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.panelHeader}>
              <div className={styles.panelHeadingText}>
                <span className={styles.eyebrow}>COMMUNITY PROJECTS</span>
                <h2 id="published-projects-title">Published Projects</h2>
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
            ) : projects.length === 0 ? (
              <div className={styles.panelState}>
                <h3>No published projects found</h3>
                <p>
                  There are currently no published projects available for
                  this barangay.
                </p>
              </div>
            ) : (
              <div className={styles.projectList}>
                {projects.map((project, index) => {
                  const sdgs =
                    Array.isArray(project.sdgTags) && project.sdgTags.length
                      ? project.sdgTags
                      : project.sdgTag
                        ? Array.isArray(project.sdgTag)
                          ? project.sdgTag
                          : [project.sdgTag]
                        : [];

                  return (
                    <article
                      className={styles.projectCard}
                      key={project._id || project.id || index}
                    >
                      <div className={styles.projectIcon} aria-hidden="true">
                        SDG
                      </div>

                      <div className={styles.projectInfo}>
                        <h3>{projectTitle(project)}</h3>

                        <div className={styles.sdgTags}>
                          {sdgs.length > 0 ? (
                            sdgs.map((sdg, sdgIndex) => (
                              <span
                                className={styles.sdgTag}
                                key={`${sdg}-${sdgIndex}`}
                              >
                                {String(sdg).startsWith("SDG")
                                  ? sdg
                                  : `SDG ${sdg}`}
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
                {projects.length} published{" "}
                {projects.length === 1 ? "project" : "projects"}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default BarangayContributionRanking;
