import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import { api } from "../../services/api";

const SDG_COLORS = [
  "#E5243B","#DDA63A","#4C9F38","#C5192D","#FF3A21","#26BDE2",
  "#FCC30B","#A21942","#FD6925","#DD1367","#FD9D24","#BF8B2E",
  "#3F7E44","#0A97D9","#56C02B","#00689D","#19486A",
];

function Dashboard() {
  const [stats, setStats]       = useState(null);
  const [projects, setProjects] = useState([]);
  const [events, setEvents]     = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/analytics/stats"),
      api.get("/projects"),
      api.get("/events"),
    ]).then(([statsRes, projectsRes, eventsRes]) => {
      setStats(statsRes.data);
      setProjects((projectsRes.data ?? projectsRes).slice(0, 5));
      setEvents((eventsRes.data ?? eventsRes).slice(0, 5));
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsGrid}>
        {[
          { label: "Total Projects",    value: stats?.totalProjects,  color: "#3b82f6" },
          { label: "Active Users",      value: stats?.totalUsers,     color: "#10b981" },
          { label: "Total Events",      value: stats?.totalEvents,    color: "#f59e0b" },
          { label: "Barangays Covered", value: stats?.totalBarangays, color: "#8b5cf6" },
        ].map((card) => (
          <div key={card.label} className={styles.statCard}>
            <p className={styles.statLabel}>{card.label}</p>
            <div className={styles.statBottom}>
              <p className={styles.statValue}>{loading ? "—" : (card.value ?? 0)}</p>
              <div className={styles.statDot} style={{ background: card.color }} />
            </div>
          </div>
        ))}
      </div>

      {/* SDG Progress Row */}
      <div className={styles.sdgRow}>
        <p className={styles.sectionTitle}>SDG Progress Overview</p>
        <div className={styles.sdgIcons}>
          {Array.from({ length: 17 }, (_, i) => (
            <div
              key={i}
              className={styles.sdgChip}
              style={{ background: SDG_COLORS[i] }}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Main content grid */}
      <div className={styles.mainGrid}>
        {/* Left — Recent Projects */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>Recent Projects</p>
          {loading && <p className={styles.empty}>Loading…</p>}
          {!loading && projects.length === 0 && <p className={styles.empty}>No projects yet.</p>}
          <div className={styles.list}>
            {projects.map((p) => (
              <div key={p._id} className={styles.listItem}>
                <div className={styles.listItemLeft}>
                  <p className={styles.listItemTitle}>{p.title}</p>
                  <p className={styles.listItemSub}>{p.barangay} · {p.sdgTag}</p>
                </div>
                <span className={`${styles.statusBadge} ${styles[p.status?.toLowerCase()]}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Middle — Upcoming Events */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>Upcoming Events</p>
          {loading && <p className={styles.empty}>Loading…</p>}
          {!loading && events.length === 0 && <p className={styles.empty}>No events yet.</p>}
          <div className={styles.list}>
            {events.map((e) => (
              <div key={e._id} className={styles.listItem}>
                <div className={styles.dateBlock}>
                  <span className={styles.dateDay}>{new Date(e.date).getDate()}</span>
                  <span className={styles.dateMonth}>
                    {new Date(e.date).toLocaleString("default", { month: "short" })}
                  </span>
                </div>
                <div className={styles.listItemLeft}>
                  <p className={styles.listItemTitle}>{e.title}</p>
                  <p className={styles.listItemSub}>{e.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Quick Actions */}
        <div className={styles.card}>
          <p className={styles.cardTitle}>Quick Actions</p>
          <div className={styles.quickActions}>
            {[
              { label: "Add Project",  path: "/data-management", color: "#3b82f6" },
              { label: "Add Event",    path: "/events-projects",  color: "#10b981" },
              { label: "Manage Users", path: "/user-management",  color: "#f59e0b" },
              { label: "View Reports", path: "/analytics",        color: "#8b5cf6" },
            ].map((action) => (
              <a key={action.label} href={action.path} className={styles.quickAction}>
                <div className={styles.quickActionDot} style={{ background: action.color }} />
                {action.label}
              </a>
            ))}
          </div>

          <p className={styles.cardTitle} style={{ marginTop: 24 }}>Activity Log</p>
          <div className={styles.activityLog}>
            <p className={styles.empty}>No recent activity.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;