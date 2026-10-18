
import { useEffect, useState } from "react";
import styles from "./BarangayContributionRanking.module.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
).replace(/\/+$/, "");

const ranks = ["1st", "2nd", "3rd", "4th", "5th"];

function BarangayContributionRanking() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBarangay, setSelectedBarangay] = useState("");
  const [publishedProjects, setPublishedProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function fetchRanking() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/projects/barangay-ranking`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Unable to load barangay rankings.");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.message || "Unable to load rankings.");
        }

        setRanking(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Something went wrong.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchRanking();

    return () => controller.abort();
  }, []);

  async function handleOpenProjects(barangay) {
    setSelectedBarangay(barangay);
    setPublishedProjects([]);
    setProjectsError("");
    setProjectsLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/projects/barangay/${encodeURIComponent(
          barangay
        )}/published`
      );

      if (!response.ok) {
        throw new Error("Unable to load published projects.");
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.message || "Unable to load published projects."
        );
      }

      setPublishedProjects(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (err) {
      setProjectsError(err.message || "Something went wrong.");
    } finally {
      setProjectsLoading(false);
    }
  }

  function closeProjects() {
    setSelectedBarangay("");
    setPublishedProjects([]);
    setProjectsError("");
  }

  function getProjectTitle(project) {
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

  return (
    <>
      <section className={styles.section}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              COMMUNITY PERFORMANCE
            </span>
            <h2>Barangay Contribution Ranking</h2>
            <p>
              Compare barangays based on their published SDG projects.
            </p>
          </div>

          <span className={styles.totalBadge}>
            {loading ? "Loading..." : `${ranking.length} ranked`}
          </span>
        </div>

        {loading ? (
          <div className={styles.state}>
            <p>Loading barangay rankings...</p>
          </div>
        ) : error ? (
          <div className={styles.state}>
            <span className={styles.stateIcon}>!</span>
            <div>
              <h3>Unable to load rankings</h3>
              <p>{error}</p>
            </div>
          </div>
        ) : ranking.length === 0 ? (
          <div className={styles.state}>
            <span className={styles.stateIcon}>—</span>
            <div>
              <h3>No published projects yet</h3>
              <p>
                Rankings will appear when published projects with barangay
                information are available.
              </p>
            </div>
          </div>
        ) : (
          <div className={styles.list}>
            {ranking.map((item, index) => (
              <article
                className={styles.row}
                key={item.barangay || index}
              >
                <div
                  className={`${styles.rank} ${
                    index < 3 ? styles[`rank${index + 1}`] : ""
                  }`}
                >
                  {ranks[index] || `${index + 1}th`}
                </div>

                <div className={styles.barangayInfo}>
                  <h3>{item.barangay || "Unnamed Barangay"}</h3>
                  <p>Published community projects</p>
                </div>

                <div className={styles.metrics}>
                  <div className={styles.metric}>
                    <strong>{item.projectCount ?? 0}</strong>
                    <span>Projects</span>
                  </div>

                  <div className={styles.metricDivider} />

                  <div className={styles.metric}>
                    <strong>{item.sdgContributions ?? 0}</strong>
                    <span>SDGs represented</span>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.rowArrow}
                  onClick={() => handleOpenProjects(item.barangay)}
                  aria-label={`View published projects for ${item.barangay}`}
                  title="View published projects"
                >
                  →
                </button>
              </article>
            ))}
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.footerDot} />
          <span>Rankings are based on published project records.</span>
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
              <div>
                <span className={styles.eyebrow}>BARANGAY DETAILS</span>
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
              <div className={styles.panelState}>
                <p>Loading published projects...</p>
              </div>
            ) : projectsError ? (
              <div className={styles.panelState}>
                <h3>Unable to load projects</h3>
                <p>{projectsError}</p>
              </div>
            ) : publishedProjects.length === 0 ? (
              <div className={styles.panelState}>
                <h3>No published projects found</h3>
                <p>
                  This barangay has no published projects available to display.
                </p>
              </div>
            ) : (
              <div className={styles.projectList}>
                {publishedProjects.map((project, index) => {
                  const sdgs =
                    Array.isArray(project.sdgTags) && project.sdgTags.length
                      ? project.sdgTags
                      : project.sdgTag
                        ? [project.sdgTag]
                        : [];

                  return (
                    <article
                      className={styles.projectCard}
                      key={project._id || index}
                    >
                      <div className={styles.projectIcon}>
                        <span>SDG</span>
                      </div>

                      <div className={styles.projectInfo}>
                        <h3>{getProjectTitle(project)}</h3>

                        <div className={styles.sdgTags}>
                          {sdgs.length ? (
                            sdgs.map((sdg, sdgIndex) => (
                              <span
                                className={styles.sdgTag}
                                key={`${sdg}-${sdgIndex}`}
                              >
                                {sdg}
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
                {publishedProjects.length === 1 ? "project" : "projects"}
              </div>
            )}
          </section>
        </div>
      )}
    </>
  );
}

export default BarangayContributionRanking;
