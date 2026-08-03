import styles from "./ProjectToolbar.module.css";
import { SDG_OPTIONS, STATUS_OPTIONS } from "./constants.js";

function ProjectToolbar({ search, onSearch, filterSDG, onFilterSDG, filterStatus, onFilterStatus }) {
  return (
    <div className={styles.toolbar}>
      <input
        className={styles.search}
        type="text"
        placeholder="Search by title or barangay…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
      />
      <select className={styles.select} value={filterSDG} onChange={(e) => onFilterSDG(e.target.value)}>
        <option value="All">All SDGs</option>
        {SDG_OPTIONS.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      <select className={styles.select} value={filterStatus} onChange={(e) => onFilterStatus(e.target.value)}>
        <option value="All">All Status</option>
        {STATUS_OPTIONS.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}

export default ProjectToolbar;