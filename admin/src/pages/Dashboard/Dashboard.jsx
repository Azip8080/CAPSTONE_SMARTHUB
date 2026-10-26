
import { useState } from "react";
import { Link } from "react-router-dom";

import BarangayContributionRanking from "./components/BarangayContributionRanking";
import SDGOverview from "./components/SDGOverview";
import ProjectStatus from "./components/ProjectStatus";
import ProjectDetailsModal from "./components/ProjectDetailsModal";
import EventDetailsModal from "./components/EventDetailsModal";
import ActivityLog from "./components/ActivityLog";

import styles from "./Dashboard.module.css";
import { useDashboard } from "./useDashboard";

function Dashboard() {
  const {
    stats,
    projects,
    events,
    activities,
    loading,
    error,
  } = useDashboard();

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [selectedEvent, setSelectedEvent] =
    useState(null);

  const recentProjects = projects.slice(0, 5);


const quickActions = [
  {
    label: "Add Project",
    path: "/data-management",
    color: "#3b82f6",
  },
  {
    label: "Add Event",
    path: "/events-projects",
    color: "#10b981",
  },
];


  const statCards = [
    {
      label: "Total Projects",
      value: stats?.totalProjects,
      color: "#3b82f6",
    },
    {
      label: "Active Users",
      value: stats?.totalUsers,
      color: "#10b981",
    },
    {
      label: "Total Events",
      value: stats?.totalEvents,
      color: "#f59e0b",
    },
    {
      label: "Barangays Covered",
      value: stats?.totalBarangays,
      color: "#8b5cf6",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          Dashboard
        </h1>
      </div>

      {/* Quick Actions - moved to the top */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>
          Quick Actions
        </p>

        <div className={styles.quickActions}>
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className={styles.quickAction}
            >
              <div
                className={styles.quickActionDot}
                style={{
                  background: action.color,
                }}
              />

              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {error && (
        <p className={styles.error}>
          {error}
        </p>
      )}

      {/* Dashboard Statistics */}
      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <div
            key={card.label}
            className={styles.statCard}
          >
            <p className={styles.statLabel}>
              {card.label}
            </p>

            <div className={styles.statBottom}>
              <p className={styles.statValue}>
                {loading ? "—" : card.value ?? 0}
              </p>

              <div
                className={styles.statDot}
                style={{
                  background: card.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* SDG Overview */}
      <SDGOverview projects={projects} />

      {/* Project Status */}
      <ProjectStatus projects={projects} />

      {/* Barangay Contribution Ranking */}
      <BarangayContributionRanking />

      {/* Recent Projects, Upcoming Events, Activity Log */}
      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>
            Recent Projects
          </p>

          {loading && (
            <p className={styles.empty}>
              Loading…
            </p>
          )}

          {!loading && recentProjects.length === 0 && (
            <p className={styles.empty}>
              No projects yet.
            </p>
          )}

          <div className={styles.list}>
            {recentProjects.map((project) => (
              <button
                key={project._id}
                type="button"
                className={styles.projectButton}
                onClick={() =>
                  setSelectedProject(project)
                }
              >
                <div className={styles.listItemLeft}>
                  <p className={styles.listItemTitle}>
                    {project.title}
                  </p>

                  <p className={styles.listItemSub}>
                    {project.barangay} · {project.sdgTag}
                  </p>
                </div>

                <span
                  className={`${styles.statusBadge} ${
                    styles[project.status?.toLowerCase()]
                  }`}
                >
                  {project.status}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardTitle}>
            Upcoming Events
          </p>

          {loading && (
            <p className={styles.empty}>
              Loading…
            </p>
          )}

          {!loading && events.length === 0 && (
            <p className={styles.empty}>
              No events yet.
            </p>
          )}

          <div className={styles.list}>
            {events.map((event) => {
              const date = new Date(event.date);

              return (
                <button
                  key={event._id}
                  type="button"
                  className={styles.eventButton}
                  onClick={() =>
                    setSelectedEvent(event)
                  }
                >
                  <div className={styles.dateBlock}>
                    <span className={styles.dateDay}>
                      {date.getDate()}
                    </span>

                    <span className={styles.dateMonth}>
                      {date.toLocaleString("default", {
                        month: "short",
                      })}
                    </span>
                  </div>

                  <div className={styles.listItemLeft}>
                    <p className={styles.listItemTitle}>
                      {event.title}
                    </p>

                    <p className={styles.listItemSub}>
                      {event.location}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardTitle}>
            Activity Log
          </p>

          <ActivityLog
            activities={activities}
            loading={loading}
          />
        </div>
      </div>

      {/* Project Details Modal */}
      <ProjectDetailsModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

export default Dashboard;
