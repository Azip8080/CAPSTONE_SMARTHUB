import { useEffect, useState } from "react";
import styles from "./BarangayContributionRanking.module.css";

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
).replace(/\/+$/, "");

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

        const response = await fetch(
          `${API_URL}/projects/barangay-ranking`,
          {
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load barangay contributions.");
        }

        const result = await response.json();

        if (!result.success) {
          throw new Error(
            result.message || "Unable to load barangay contributions."
          );
        }

        const data = Array.isArray(result.data) ? result.data : [];

        setBarangays(data);
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

    fetchBarangayContributions();

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

  function getBarangaySdgs(item) {
    if (Array.isArray(item.sdgTags) && item.sdgTags.length) {
      return [...new Set(item.sdgTags)];
    }

    if (Array.isArray(item.sdgs) && item.sdgs.length) {
      return [...new Set(item.sdgs)];
    }

    if (item.sdgTag) {
      return [item.sdgTag];
    }

    return [];
  }

  const maxProjects = Math.max(
    ...barangays.map((item) => Number(item.projectCount) || 0),
    1
  );

  return (
    <>
      <section className={styles.section}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>
              COMMUNITY CONTRIBUTIONS
            </span>

            <h2>Barangay SDG Contributions</h2>

            <p>
              View the number of published projects and SDGs represented by
              each registered barangay.
            </p>
          </div>

          <span className={styles.totalBadge}>
            {loading ? "Loading..." : `${barangays.length} barangays`}
          </span>
        </div>

        {loading ? (
          <div className={styles.state}>
            <p>Loading barangay contributions...</p>
          </div>
        ) : error ? (
          <div className={styles.state}>
            <span className={styles.stateIcon}>!</span>

            <div>
              <h3>Unable to load barangay contributions</h3>
              <p>{error}</p>
            </div>
          </div>
        ) : barangays.length === 0 ? (
          <div className={styles.state}>
            <span className={styles.stateIcon}>—</span>

            <div>
              <h3>No barangay project data yet</h3>

              <p>
                Barangay contributions will appear when published projects
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

              const sdgs = getBarangaySdgs(item);

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
                        {projectCount === 1 ? "published project" : "published projects"}
                      </span>
                    </div>

                    <strong className={styles.projectCount}>
                      {projectCount}
                    </strong>
                  </div>

                  <button
                    type="button"
                    className={styles.barTrackButton}
                    onClick={() =>
                      handleOpenProjects(item.barangay)
                    }
                    aria-label={`View published projects for ${
                      item.barangay
                    }`}
                    title="View published projects"
                  >
                    <span
                      className={styles.barFill}
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </button>
                  <button
                    type="button"
                    className={styles.viewButton}
                    onClick={() =>
                      handleOpenProjects(item.barangay)
                    }
                  >
                    View projects
                    <span>→</span>
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
                  This barangay has no published projects available
                  to display.
                </p>
              </div>
            ) : (
              <div className={styles.projectList}>
                {publishedProjects.map((project, index) => {
                  const sdgs =
                    Array.isArray(project.sdgTags) &&
                    project.sdgTags.length
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
                          Published:{" "}
                          {formatDate(project.publishedAt)}
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