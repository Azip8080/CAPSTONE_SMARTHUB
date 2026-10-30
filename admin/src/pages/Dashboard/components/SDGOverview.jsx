
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

import ProjectDetailsModal from "./ProjectDetailsModal";
import EventDetailsModal from "./EventDetailsModal";

const SDG_COLORS = [
  "#E5243B", "#DDA63A", "#4C9F38", "#C5192D",
  "#FF3A21", "#26BDE2", "#FCC30B", "#A21942",
  "#FD6925", "#DD1367", "#FD9D24", "#BF8B2E",
  "#3F7E44", "#0A97D9", "#56C02B", "#00689D",
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
  sdg1, sdg2, sdg3, sdg4, sdg5, sdg6, sdg7, sdg8,
  sdg9, sdg10, sdg11, sdg12, sdg13, sdg14, sdg15,
  sdg16, sdg17,
];

const SDG_LIST = SDG_NAMES.map((name, index) => ({
  tag: `SDG ${index + 1}`,
  number: index + 1,
  name,
  color: SDG_COLORS[index],
  image: SDG_IMAGES[index],
}));

function normalizeSdgTag(value) {
  if (value === null || value === undefined) return [];

  const values = Array.isArray(value) ? value : [value];

  return values.flatMap((item) => {
    if (typeof item === "number") {
      return [`SDG ${item}`];
    }

    if (typeof item === "object" && item !== null) {
      return normalizeSdgTag(
        item.sdgTag ?? item.tag ?? item.name ?? item.number
      );
    }

    const text = String(item).trim();
    if (!text) return [];

    const match = text.match(/(?:SDG\s*)?(\d{1,2})/i);

    if (match && Number(match[1]) >= 1 && Number(match[1]) <= 17) {
      return [`SDG ${Number(match[1])}`];
    }

    return [text];
  });
}

function getProjectSdgs(project) {
  return [
    ...new Set(
      [
        ...normalizeSdgTag(project?.sdgTag),
        ...normalizeSdgTag(project?.sdgTags),
        ...normalizeSdgTag(project?.tags),
      ]
    ),
  ];
}

function getEventSdgs(event) {
  return [
    ...new Set(
      [
        ...normalizeSdgTag(event?.sdgTag),
        ...normalizeSdgTag(event?.sdgTags),
        ...normalizeSdgTag(event?.sdg),
        ...normalizeSdgTag(event?.sdgNumber),
        ...normalizeSdgTag(event?.sdgGoal),
        ...normalizeSdgTag(event?.tags),
      ]
    ),
  ];
}

function getStatusClass(status) {
  const normalized = String(status || "Planned").toLowerCase();

  if (normalized === "completed") return styles.completed;
  if (normalized === "ongoing") return styles.ongoing;

  return styles.planned;
}

function getEventDate(event) {
  const date = event?.date || event?.startDate || event?.eventDate;

  if (!date) return "";

  const parsed = new Date(date);

  return Number.isNaN(parsed.getTime())
    ? String(date)
    : parsed.toLocaleDateString();
}

function SDGOverview({ projects = [], events = [] }) {
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedSDG, setSelectedSDG] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [metricFilter, setMetricFilter] = useState(null);

  const sdgData = useMemo(
    () =>
      SDG_LIST.map((sdg) => {
        const matchingProjects = projects.filter((project) =>
          getProjectSdgs(project).includes(sdg.tag)
        );

        const matchingEvents = events.filter((event) =>
          getEventSdgs(event).includes(sdg.tag)
        );

        return {
          ...sdg,
          projects: matchingProjects,
          events: matchingEvents,
          count: matchingProjects.length,
          eventCount: matchingEvents.length,
        };
      }),
    [projects, events]
  );

  const publishedProjects = useMemo(
    () =>
      projects.filter(
        (project) => project.publicationStatus === "Published"
      ),
    [projects]
  );

  const sdgsWithProjectsCount = sdgData.filter(
    (sdg) => sdg.count > 0
  ).length;

  const pageSize = 5;

  const filteredSdgs =
    metricFilter === "withProjects"
      ? sdgData.filter((sdg) => sdg.count > 0)
      : metricFilter === "withEvents"
        ? sdgData.filter((sdg) => sdg.eventCount > 0)
        : sdgData;

  const pageCount = Math.max(
    1,
    Math.ceil(filteredSdgs.length / pageSize)
  );

  const safePage = Math.min(currentPage, pageCount - 1);

  const visibleSdgs = filteredSdgs.slice(
    safePage * pageSize,
    safePage * pageSize + pageSize
  );

  function handleMetricClick(filter) {
    setMetricFilter((current) => current === filter ? null : filter);
    setCurrentPage(0);
    setSelectedSDG(null);
    setSelectedProject(null);
    setSelectedEvent(null);
  }

  function selectSDG(sdg) {
    setSelectedSDG((current) =>
      current?.tag === sdg.tag ? null : sdg
    );
    setSelectedProject(null);
    setSelectedEvent(null);
  }

  function changePage(page) {
    setCurrentPage(Math.max(0, Math.min(pageCount - 1, page)));
    setSelectedSDG(null);
    setSelectedProject(null);
    setSelectedEvent(null);
  }

  function clearFilters() {
    setSelectedSDG(null);
    setSelectedProject(null);
    setSelectedEvent(null);
    setMetricFilter(null);
    setCurrentPage(0);
  }

  const showingEvents = metricFilter === "events";

  const metricProjectList =
    metricFilter === "published" ? publishedProjects : projects;

  const metricResultsVisible = [
    "all",
    "published",
    "events",
  ].includes(metricFilter);

  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>SDG Project Overview</h2>
          <p className={styles.subtitle}>
            Explore the Sustainable Development Goals and their
            associated community projects and events.
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
            metricFilter === "all" ? styles.metricActive : ""
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
            metricFilter === "published" ? styles.metricActive : ""
          }`}
          onClick={() => handleMetricClick("published")}
          aria-pressed={metricFilter === "published"}
        >
          <span>Published Projects</span>
          <strong>{publishedProjects.length}</strong>
          <small>View published projects</small>
        </button>

        <button
          type="button"
          className={`${styles.metric} ${
            metricFilter === "events" ? styles.metricActive : ""
          }`}
          onClick={() => handleMetricClick("events")}
          aria-pressed={metricFilter === "events"}
        >
          <span>Total Events</span>
          <strong>{events.length}</strong>
          <small>Click to view events</small>
        </button>

        <button
          type="button"
          className={`${styles.metric} ${
            metricFilter === "withProjects" ? styles.metricActive : ""
          }`}
          onClick={() => handleMetricClick("withProjects")}
          aria-pressed={metricFilter === "withProjects"}
        >
          <span>SDGs with Projects</span>
          <strong>
            {sdgsWithProjectsCount}
            <small> / 17</small>
          </strong>
          <small>Show SDGs with projects</small>
        </button>

        <button
          type="button"
          className={`${styles.metric} ${
            metricFilter === "withEvents" ? styles.metricActive : ""
          }`}
          onClick={() => handleMetricClick("withEvents")}
          aria-pressed={metricFilter === "withEvents"}
        >
          <span>SDGs with Events</span>
          <strong>
            {sdgData.filter((sdg) => sdg.eventCount > 0).length}
            <small> / 17</small>
          </strong>
          <small>Show SDGs with events</small>
        </button>
      </div>

      {metricResultsVisible && (
        <section className={styles.metricResults}>
          <div className={styles.metricResultsHeader}>
            <div>
              <h3>
                {showingEvents
                  ? "All Events"
                  : metricFilter === "published"
                    ? "Published Projects"
                    : "All Projects"}
              </h3>

              <p>
                {showingEvents
                  ? "Select an event to view its full details."
                  : metricFilter === "published"
                    ? "Projects currently published in the system."
                    : "All community projects recorded in the system."}
              </p>
            </div>

            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setMetricFilter(null);
                setSelectedEvent(null);
                setSelectedProject(null);
              }}
            >
              Close
            </button>
          </div>

          {showingEvents ? (
            events.length === 0 ? (
              <p className={styles.empty}>No events found.</p>
            ) : (
              <div className={styles.projectList}>
                {events.map((event, index) => (
                  <button
                    type="button"
                    className={styles.projectButton}
                    key={event._id || event.id || `event-${index}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className={styles.projectInfo}>
                      <h4 className={styles.projectTitle}>
                        {event.title || "Untitled event"}
                      </h4>

                      <p className={styles.projectSub}>
                        {event.location || event.barangay || "Community event"}
                        {getEventDate(event) && ` · ${getEventDate(event)}`}
                        {getEventSdgs(event).length > 0 &&
                          ` · ${getEventSdgs(event).join(", ")}`}
                      </p>
                    </div>

                    <span className={`${styles.status} ${styles.eventStatus}`}>
                      View details
                    </span>
                  </button>
                ))}
              </div>
            )
          ) : metricProjectList.length === 0 ? (
            <p className={styles.empty}>No projects found.</p>
          ) : (
            <div className={styles.projectList}>
              {metricProjectList.map((project, index) => (
                <button
                  type="button"
                  className={styles.projectButton}
                  key={project._id || project.id || `project-${index}`}
                  onClick={() => setSelectedProject(project)}
                >
                  <div className={styles.projectInfo}>
                    <h4 className={styles.projectTitle}>
                      {project.title || "Untitled project"}
                    </h4>

                    <p className={styles.projectSub}>
                      {getProjectSdgs(project).join(", ") || "No SDG assigned"}
                      {" · "}
                      {project.barangay || "Community project"}
                    </p>
                  </div>

                  <span
                    className={`${styles.status} ${getStatusClass(project.status)}`}
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
              : metricFilter === "withEvents"
                ? "SDGs with Associated Events"
                : "Explore the SDGs"}
          </h3>

          <p>
            Showing{" "}
            {filteredSdgs.length === 0 ? 0 : safePage * pageSize + 1}
            –
            {Math.min((safePage + 1) * pageSize, filteredSdgs.length)} of{" "}
            {filteredSdgs.length} goals
          </p>
        </div>
      </div>

      {visibleSdgs.length === 0 ? (
        <p className={styles.empty}>
          No SDGs match this selection. Check that your projects and events
          have valid SDG tags such as "SDG 4".
        </p>
      ) : (
        <div className={styles.sdgGrid}>
          {visibleSdgs.map((sdg) => {
            const isSelected = selectedSDG?.tag === sdg.tag;

            return (
              <button
                type="button"
                key={sdg.tag}
                className={`${styles.sdgItem} ${
                  isSelected ? styles.selected : ""
                }`}
                style={{ "--sdg-color": sdg.color }}
                onClick={() => selectSDG(sdg)}
                aria-label={`${sdg.tag}: ${sdg.name}, ${sdg.count} projects and ${sdg.eventCount} events`}
                aria-pressed={isSelected}
              >
                <img
                  src={sdg.image}
                  alt={`${sdg.tag}: ${sdg.name}`}
                  className={styles.sdgImage}
                />

              <span className={styles.count}>
                {sdg.count + sdg.eventCount}
                </span>
              </button>
            );
          })}
        </div>
      )}

      <nav className={styles.pagination} aria-label="SDG pages">
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

      {selectedSDG && (
        <section
          className={styles.details}
          style={{ borderTopColor: selectedSDG.color }}
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
                Associated projects and events
              </p>
            </div>

            <div className={styles.detailCounts}>
              <div className={styles.projectCount}>
                <strong>{selectedSDG.projects.length}</strong>
                <span>
                  {selectedSDG.projects.length === 1 ? "Project" : "Projects"}
                </span>
              </div>

              <div className={styles.projectCount}>
                <strong>{selectedSDG.events.length}</strong>
                <span>
                  {selectedSDG.events.length === 1 ? "Event" : "Events"}
                </span>
              </div>
            </div>
          </div>

          <section className={styles.relatedSection}>
            <h4 className={styles.relatedTitle}>
              Projects ({selectedSDG.projects.length})
            </h4>

            {selectedSDG.projects.length === 0 ? (
              <p className={styles.empty}>
                No projects are currently associated with this SDG.
              </p>
            ) : (
              <div className={styles.projectList}>
                {selectedSDG.projects.map((project, index) => (
                  <button
                    type="button"
                    className={styles.projectButton}
                    key={project._id || project.id || `sdg-project-${index}`}
                    onClick={() => setSelectedProject(project)}
                  >
                    <div className={styles.projectInfo}>
                      <h4 className={styles.projectTitle}>
                        {project.title || "Untitled project"}
                      </h4>

                      <p className={styles.projectSub}>
                        {project.barangay || "Community project"}
                        {" · "}
                        {project.document?.originalName || "No document uploaded"}
                      </p>
                    </div>

                    <span
                      className={`${styles.status} ${getStatusClass(project.status)}`}
                    >
                      {project.status || "Planned"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section className={styles.relatedSection}>
            <h4 className={styles.relatedTitle}>
              Events ({selectedSDG.events.length})
            </h4>

            {selectedSDG.events.length === 0 ? (
              <p className={styles.empty}>
                No events are currently associated with this SDG.
              </p>
            ) : (
              <div className={styles.projectList}>
                {selectedSDG.events.map((event, index) => (
                  <button
                    type="button"
                    className={styles.projectButton}
                    key={event._id || event.id || `sdg-event-${index}`}
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className={styles.projectInfo}>
                      <h4 className={styles.projectTitle}>
                        {event.title || "Untitled event"}
                      </h4>

                      <p className={styles.projectSub}>
                        {event.location || event.barangay || "Community event"}
                        {getEventDate(event) && ` · ${getEventDate(event)}`}
                        {getEventSdgs(event).length > 0 &&
                          ` · ${getEventSdgs(event).join(", ")}`}
                      </p>
                    </div>

                    <span className={`${styles.status} ${styles.eventStatus}`}>
                      View details
                    </span>
                  </button>
                ))}
              </div>
            )}
          </section>
        </section>
      )}

      <ProjectDetailsModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </section>
  );
}

export default SDGOverview;
