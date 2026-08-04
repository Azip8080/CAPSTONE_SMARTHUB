import styles from "./StatsGrid.module.css";

function StatsGrid({ stats }) {
  const cards = [
    { label: "Total Projects", value: stats?.totalProjects, color: "#3b82f6" },
    { label: "Total Events", value: stats?.totalEvents, color: "#10b981" },
    { label: "Total Users", value: stats?.totalUsers, color: "#f59e0b" },
    { label: "Barangays Covered", value: stats?.totalBarangays, color: "#8b5cf6" },
  ];

  return (
    <div className={styles.statsGrid}>
      {cards.map((s) => (
        <div key={s.label} className={styles.statCard} style={{ borderTop: `3px solid ${s.color}` }}>
          <p className={styles.statLabel}>{s.label}</p>
          <p className={styles.statValue}>{stats ? (s.value ?? 0) : "—"}</p>
        </div>
      ))}
    </div>
  );
}

export default StatsGrid;