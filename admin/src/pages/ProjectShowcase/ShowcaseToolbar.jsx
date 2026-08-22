import styles from "./ShowcaseToolbar.module.css";
import { SDG_OPTIONS, STATUS_OPTIONS } from "./constants.js";

function ShowcaseToolbar({ search, onSearch, sdgFilter, onSdgFilter, statusFilter, onStatusFilter, resultCount }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <input
          className={styles.search}
          placeholder="Search by title or barangay…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select className={styles.select} value={sdgFilter} onChange={(e) => onSdgFilter(e.target.value)}>
          {SDG_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={styles.select} value={statusFilter} onChange={(e) => onStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>
      <p className={styles.resultCount}>
        {resultCount} project{resultCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default ShowcaseToolbar;