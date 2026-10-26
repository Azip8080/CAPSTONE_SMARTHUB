import { useMemo, useState } from "react";
import styles from "./SDGOverview.module.css";

import sdg1 from "../../../assets/1.jpg";
import sdg2 from "../../../assets/2.jpg";
import sdg3 from "../../../assets/3.jpg";
import sdg4 from "../../../assets/4.jpg";
import sdg5 from "../../../assets/5.jpg";
import sdg6 from "../../../assets/6.jpg";
import sdg7 from "../../../assets/7.jpg";
import sdg8 from "../../../assets/8.jpg";
import sdg9 from "../../../assets/9.jpg";
import sdg10 from "../../../assets/10.jpg";
import sdg11 from "../../../assets/11.jpg";
import sdg12 from "../../../assets/12.jpg";
import sdg13 from "../../../assets/13.jpg";
import sdg14 from "../../../assets/14.jpg";
import sdg15 from "../../../assets/15.jpg";
import sdg16 from "../../../assets/16.jpg";
import sdg17 from "../../../assets/17.jpg";

const SDG_COLORS = [
  "#E5243B",
  "#DDA63A",
  "#4C9F38",
  "#C5192D",
  "#FF3A21",
  "#26BDE2",
  "#FCC30B",
  "#A21942",
  "#FD6925",
  "#DD1367",
  "#FD9D24",
  "#BF8B2E",
  "#3F7E44",
  "#0A97D9",
  "#56C02B",
  "#00689D",
  "#19486A",
];

const SDG_NAMES = [
  "No Poverty",
  "Zero Hunger",
  "Good Health and Well-being",
  "Quality Education",
  "Gender Equality",
  "Clean Water and Sanitation",
  "Affordable and Clean Energy",
  "Decent Work and Economic Growth",
  "Industry, Innovation and Infrastructure",
  "Reduced Inequalities",
  "Sustainable Cities and Communities",
  "Responsible Consumption and Production",
  "Climate Action",
  "Life Below Water",
  "Life on Land",
  "Peace, Justice and Strong Institutions",
  "Partnerships for the Goals",
];

const SDG_IMAGES = [
  sdg1,
  sdg2,
  sdg3,
  sdg4,
  sdg5,
  sdg6,
  sdg7,
  sdg8,
  sdg9,
  sdg10,
  sdg11,
  sdg12,
  sdg13,
  sdg14,
  sdg15,
  sdg16,
  sdg17,
];

const SDG_LIST = SDG_NAMES.map((name, index) => ({
  tag: `SDG ${index + 1}`,
  number: index + 1,
  name,
  color: SDG_COLORS[index],
  image: SDG_IMAGES[index],
}));

const API_BASE = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

function getProjectSdgs(project) {
  const tags = Array.isArray(project?.sdgTags)
    ? project.sdgTags
    : [];

  return [
    ...new Set(
      [project?.sdgTag, ...tags].filter(Boolean)
    ),
  ];
}

function getDocumentUrl(documentPath) {
  if (!documentPath) return "";

  if (/^https?:\/\//i.test(documentPath)) {
    return documentPath;
  }

  return `${API_BASE}${
    documentPath.startsWith("/") ? "" : "/"
  }${documentPath}`;
}

function getFileExtension(name = "") {
  return name.split(".").pop()?.toLowerCase() || "";
}

function getStatusClass(status) {
  const normalized = String(
    status || "Planned"
  ).toLowerCase();

  if (normalized === "completed") {
    return styles.completed;
  }

  if (normalized === "ongoing") {
    return styles.ongoing;
  }

  return styles.planned;
}

function SDGOverview({ projects = [] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSDG, setSelectedSDG] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [metricFilter, setMetricFilter] = useState(null);

  const sdgData = useMemo(
    () =>
      SDG_LIST.map((sdg) => {
        const matchingProjects = projects.filter(
          (project) =>
            getProjectSdgs(project).includes(sdg.tag)
        );

        return {
          ...sdg,
          projects: matchingProjects,
          count: matchingProjects.length,
        };
      }),
    [projects]
  );

  const publishedProjects = projects.filter(
    (project) =>
      project.publicationStatus === "Published"
  );

  const sdgsWithProjectsCount = sdgData.filter(
    (sdg) => sdg.count > 0
  ).length;

  const pageSize = 5;

  const filteredSdgs =
    metricFilter === "withProjects"
      ? sdgData.filter((sdg) => sdg.count > 0)
      : sdgData;

  const pageCount = Math.max(
    1,
    Math.ceil(filteredSdgs.length / pageSize)
  );

  const safePage = Math.min(
    currentPage,
    pageCount - 1
  );

  const visibleSdgs = filteredSdgs.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize
  );

  const selectedProjects =
    selectedSDG?.projects || [];

  const projectDocument = selectedProject?.document;

  const documentUrl = getDocumentUrl(
    projectDocument?.path
  );

  const extension = getFileExtension(
    projectDocument?.originalName
  );

  const canPreview =
    projectDocument?.mimeType === "application/pdf" ||
    projectDocument?.mimeType === "text/plain" ||
    extension === "pdf" ||
    extension === "txt";

  function handleMetricClick(filter) {
    setMetricFilter((current) =>
      current === filter ? null : filter
    );

    setCurrentPage(0);
    setSelectedSDG(null);
    setSelectedProject(null);
  }

  function selectSDG(sdg) {
    setSelectedSDG((current) =>
      current?.tag === sdg.tag ? null : sdg
    );

    setSelectedProject(null);
  }

  function changePage(page) {
    setCurrentPage(
      Math.max(0, Math.min(pageCount - 1, page))
    );

    setSelectedSDG(null);
    setSelectedProject(null);
  }

  function closeProject() {
    setSelectedProject(null);
  }

  function clearFilters() {
    setSelectedSDG(null);
    setSelectedProject(null);
    setMetricFilter(null);
    setCurrentPage(0);
  }

  const metricProjectList =
    metricFilter === "published"
      ? publishedProjects
      : projects;

  return (
    <section className={styles.card}>
      {/* Header */}
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>
            SDG Project Overview
          </h2>

          <p className={styles.subtitle}>
            Explore the Sustainable Development Goals
            and their associated community projects.
          </p>
        </div>

        {(selectedSDG || metricFilter) && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearFilters}
          >
            Clear selection
          </button>
        )}
      </header>
      <div className={styles.metrics}>
        <button
          type="button"
          className={`${styles.metric} ${
            metricFilter === "all"
              ? styles.metricActive
              : ""
          }`}
          onClick={() => handleMetricClick("all")}
          aria-pressed={metricFilter === "all"}
        >
          <span>Total Projects</span>
          <strong>{projects.length}</strong>
          <small>View all projects</small>
        </button>

        <button
          type="button"
          className={`${styles.metric} ${
            metricFilter === "published"
              ? styles.metricActive
              : ""
          }`}
          onClick={() =>
            handleMetricClick("published")
          }
          aria-pressed={metricFilter === "published"}
        >
          <span>Published Projects</span>
          <strong>{publishedProjects.length}</strong>
          <small>View published projects</small>
        </button>

        <button
          type="button"
          className={`${styles.metric} ${
            metricFilter === "withProjects"
              ? styles.metricActive
              : ""
          }`}
          onClick={() =>
            handleMetricClick("withProjects")
          }
          aria-pressed={
            metricFilter === "withProjects"
          }
        >
          <span>SDGs with Projects</span>

          <strong>
            {sdgsWithProjectsCount}
            <small> / 17</small>
          </strong>

          <small>Show SDGs with projects</small>
        </button>
      </div>
      {(metricFilter === "all" ||
        metricFilter === "published") && (
        <section className={styles.metricResults}>
          <div className={styles.metricResultsHeader}>
            <div>
              <h3>
                {metricFilter === "published"
                  ? "Published Projects"
                  : "All Projects"}
              </h3>

              <p>
                {metricFilter === "published"
                  ? "Projects currently published in the system."
                  : "All community projects recorded in the system."}
              </p>
            </div>

            <button
              type="button"
              className={styles.clearButton}
              onClick={() => setMetricFilter(null)}
            >
              Close
            </button>
          </div>

          {metricProjectList.length === 0 ? (
            <p className={styles.empty}>
              No projects found.
            </p>
          ) : (
            <div className={styles.projectList}>
              {metricProjectList.map((project) => (
                <button
                  type="button"
                  className={styles.projectButton}
                  key={
                    project._id ||
                    project.id ||
                    project.title
                  }
                  onClick={() =>
                    setSelectedProject(project)
                  }
                >
                  <div className={styles.projectInfo}>
                    <h4 className={styles.projectTitle}>
                      {project.title ||
                        "Untitled project"}
                    </h4>

                    <p className={styles.projectSub}>
                      {getProjectSdgs(project).join(", ") ||
                        "No SDG assigned"}
                      {" · "}
                      {project.barangay ||
                        "Community project"}
                    </p>
                  </div>

                  <span
                    className={`${styles.status} ${getStatusClass(
                      project.status
                    )}`}
                  >
                    {project.status || "Planned"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
      <div className={styles.sectionHeading}>
        <div>
          <h3>
            {metricFilter === "withProjects"
              ? "SDGs with Associated Projects"
              : "Explore the SDGs"}
          </h3>

          <p>
            Showing{" "}
            {filteredSdgs.length === 0
              ? 0
              : safePage * pageSize + 1}
            –
            {Math.min(
              (safePage + 1) * pageSize,
              filteredSdgs.length
            )}{" "}
            of {filteredSdgs.length} goals
          </p>
        </div>
      </div>
      {visibleSdgs.length === 0 ? (
        <p className={styles.empty}>
          No SDGs have associated projects yet. Check
          that your projects have an SDG tag such as
          "SDG 4".
        </p>
      ) : (
        <div className={styles.sdgGrid}>
          {visibleSdgs.map((sdg) => {
            const isSelected =
              selectedSDG?.tag === sdg.tag;

            return (
              <button
                type="button"
                key={sdg.tag}
                className={`${styles.sdgItem} ${
                  isSelected ? styles.selected : ""
                }`}
                style={{
                  "--sdg-color": sdg.color,
                }}
                onClick={() => selectSDG(sdg)}
                aria-label={`${sdg.tag}: ${sdg.name}, ${sdg.count} projects`}
                aria-pressed={isSelected}
              >
                <img
                  src={sdg.image}
                  alt={`${sdg.tag}: ${sdg.name}`}
                  className={styles.sdgImage}
                />

                <span className={styles.count}>
                  {sdg.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

<nav
  className={styles.pagination}
  aria-label="SDG pages"
>
  <button
    type="button"
    className={styles.paginationButton}
    onClick={() => changePage(safePage - 1)}
    disabled={safePage === 0}
    aria-label="Previous page"
    title="Previous page"
  >
    &#8592;
  </button>

  <button
    type="button"
    className={styles.paginationButton}
    onClick={() => changePage(safePage + 1)}
    disabled={safePage >= pageCount - 1}
    aria-label="Next page"
    title="Next page"
  >
    &#8594;
  </button>
</nav>

      {/* Selected SDG projects */}
      {selectedSDG && (
        <section
          className={styles.details}
          style={{
            borderTopColor: selectedSDG.color,
          }}
        >
          <div className={styles.detailsHeader}>
            <img
              src={selectedSDG.image}
              alt=""
              className={styles.detailsImage}
            />

            <div>
              <h3 className={styles.detailsTitle}>
                {selectedSDG.tag}: {selectedSDG.name}
              </h3>

              <p className={styles.detailsName}>
                Associated community projects
              </p>
            </div>

            <div className={styles.projectCount}>
              <strong>{selectedProjects.length}</strong>

              <span>
                {selectedProjects.length === 1
                  ? "Project"
                  : "Projects"}
              </span>
            </div>
          </div>

          {selectedProjects.length === 0 ? (
            <p className={styles.empty}>
              No projects are currently associated with
              this SDG.
            </p>
          ) : (
            <div className={styles.projectList}>
              {selectedProjects.map((project) => (
                <button
                  type="button"
                  className={styles.projectButton}
                  key={
                    project._id ||
                    project.id ||
                    project.title
                  }
                  onClick={() =>
                    setSelectedProject(project)
                  }
                >
                  <div className={styles.projectInfo}>
                    <h4 className={styles.projectTitle}>
                      {project.title ||
                        "Untitled project"}
                    </h4>

                    <p className={styles.projectSub}>
                      {project.barangay ||
                        "Community project"}
                      {" · "}
                      {project.document?.originalName ||
                        "No document uploaded"}
                    </p>
                  </div>

                  <span
                    className={`${styles.status} ${getStatusClass(
                      project.status
                    )}`}
                  >
                    {project.status || "Planned"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
      {selectedProject && (
        <div
          className={styles.documentBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeProject();
            }
          }}
        >
          <section
            className={styles.documentModal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="sdg-document-title"
          >
            <header className={styles.documentHeader}>
              <div>
                <p>Project document</p>

                <h3 id="sdg-document-title">
                  {selectedProject.title ||
                    "Project details"}
                </h3>
              </div>

              <button
                type="button"
                className={styles.documentClose}
                onClick={closeProject}
                aria-label="Close document"
              >
                ×
              </button>
            </header>

            <div className={styles.documentBody}>
              {documentUrl && canPreview ? (
                <iframe
                  title={`Document for ${
                    selectedProject.title || "project"
                  }`}
                  src={documentUrl}
                  className={styles.documentFrame}
                />
              ) : documentUrl ? (
                <div className={styles.documentMessage}>
                  <p>
                    This file type cannot be previewed
                    directly here. Download the original
                    file to view it.
                  </p>

                  <a
                    className={styles.documentLink}
                    href={documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={
                      projectDocument?.originalName || true
                    }
                  >
                    Download{" "}
                    {projectDocument?.originalName ||
                      "project document"}
                  </a>
                </div>
              ) : (
                <div className={styles.documentMessage}>
                  <p>
                    No document has been uploaded for
                    this project yet.
                  </p>

                  <p>
                    {selectedProject.description ||
                      "Contact the project administrator for more information."}
                  </p>
                </div>
              )}
            </div>

            <footer className={styles.documentFooter}>
              {documentUrl && (
                <a
                  className={styles.documentLink}
                  href={documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={
                    projectDocument?.originalName || true
                  }
                >
                  Open or download original
                </a>
              )}

              <button
                type="button"
                onClick={closeProject}
              >
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </section>
  );
}

export default SDGOverview;