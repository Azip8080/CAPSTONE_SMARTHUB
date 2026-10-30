import { useState } from "react";

import BarangayContributionRanking from "./components/BarangayContributionRanking";
import SDGOverview from "./components/SDGOverview";
import ProjectStatus from "./components/ProjectStatus";
import ProjectDetailsModal from "./components/ProjectDetailsModal";
import EventDetailsModal from "./components/EventDetailsModal";
import ActivityLog from "./components/ActivityLog";
import CompletionReports from "../CompletionReports";
import BarChart from "../Analytics/Barchart";
import DoughnutChart from "../Analytics/DoughNutChart";
import LineChart from "../Analytics/LineChart";
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

  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState("all");

  const recentProjects = projects.slice(0, 5);

  const statCards = [
    {
      label: "Total Projects",
      value: stats?.totalProjects,
      color: "#4470AD",
    },
    {
      label: "Active Users",
      value: stats?.totalUsers,
      color: "#6F94C5",
    },
    {
      label: "Total Events",
      value: stats?.totalEvents,
      color: "#2F5488",
    },
    {
      label: "Barangays Covered",
      value: stats?.totalBarangays,
      color: "#4DADBC",
    },
  ];

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.statsGrid}>
        {statCards.map((card) => (
          <div key={card.label} className={styles.statCard}>
            <p className={styles.statLabel}>{card.label}</p>

            <div className={styles.statBottom}>
              <p className={styles.statValue}>
                {loading ? "—" : card.value ?? 0}
              </p>

              <div
                className={styles.statDot}
                style={{ background: card.color }}
              />
            </div>
          </div>
        ))}
      </div>

      <SDGOverview projects={projects} events={events} />

      <section className={styles.analyticsSection}>
        <div className={styles.analyticsHeader}>
          <div>
            <p className={styles.analyticsEyebrow}>Admin Analytics</p>
            <h2 className={styles.analyticsTitle}>SDG Analytics</h2>
            <p className={styles.analyticsDescription}>
              Monitor project distribution, SDG participation, and activity trends.
            </p>
          </div>

          <div className={styles.analyticsRange}>
            {[
              { label: "7 Days", value: "7d" },
              { label: "30 Days", value: "30d" },
              { label: "90 Days", value: "90d" },
              { label: "All", value: "all" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                className={
                  analyticsRange === item.value
                    ? styles.analyticsRangeActive
                    : styles.analyticsRangeButton
                }
                onClick={() => setAnalyticsRange(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.analyticsGrid}>
          <DoughnutChart range={analyticsRange} />
          <BarChart range={analyticsRange} />
        </div>

        <div className={styles.analyticsFullWidth}>
          <LineChart range={analyticsRange} />
        </div>
      </section>

      <ProjectStatus projects={projects} />

      <BarangayContributionRanking />

      <div className={styles.mainGrid}>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Recent Projects</p>

          {loading && <p className={styles.empty}>Loading…</p>}

          {!loading && recentProjects.length === 0 && (
            <p className={styles.empty}>No projects yet.</p>
          )}

          <div className={styles.list}>
            {recentProjects.map((project) => (
              <button
                key={project._id}
                type="button"
                className={styles.projectButton}
                onClick={() => setSelectedProject(project)}
              >
                <div className={styles.listItemLeft}>
                  <p className={styles.listItemTitle}>{project.title}</p>
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
          <p className={styles.cardTitle}>Upcoming Events</p>

          {loading && <p className={styles.empty}>Loading…</p>}

          {!loading && events.length === 0 && (
            <p className={styles.empty}>No events yet.</p>
          )}

          <div className={styles.list}>
            {events.map((event) => {
              const date = new Date(event.date);

              return (
                <button
                  key={event._id}
                  type="button"
                  className={styles.eventButton}
                  onClick={() => setSelectedEvent(event)}
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
                    <p className={styles.listItemTitle}>{event.title}</p>
                    <p className={styles.listItemSub}>{event.location}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardTitle}>Activity Log</p>
          <ActivityLog activities={activities} loading={loading} />
        </div>
      </div>

      <section className={styles.completionReportsSection}>
        <CompletionReports />
      </section>

      <ProjectDetailsModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />

      <EventDetailsModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
}

export default Dashboard;