import styles from "./SummaryRow.module.css";

function SummaryRow({ counts, loading }) {
  const cards = [
    { label: "Total Users", value: counts.all, color: "#3b82f6" },
    { label: "Admins", value: counts.admin, color: "#8b5cf6" },
    { label: "Barangay Personnel", value: counts.barangay_personnel, color: "#f59e0b" },
    { label: "Community Members", value: counts.community_member, color: "#10b981" },
  ];

  return (
    <div className={styles.summaryRow}>
      {cards.map((s) => (
        <div key={s.label} className={styles.summaryCard} style={{ borderTop: `3px solid ${s.color}` }}>
          <p className={styles.summaryLabel}>{s.label}</p>
          <p className={styles.summaryValue}>{loading ? "—" : s.value}</p>
        </div>
      ))}
    </div>
  );
}

export default SummaryRow;