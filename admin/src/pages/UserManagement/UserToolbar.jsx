import styles from "./UserToolbar.module.css";
import { ROLE_OPTIONS, ROLE_LABELS } from "./constants.js";

function UserToolbar({ search, onSearch, roleFilter, onRoleFilter, resultCount }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <input
          className={styles.search}
          placeholder="Search by name, email or barangay…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select className={styles.filterSelect} value={roleFilter} onChange={(e) => onRoleFilter(e.target.value)}>
          <option value="All">All roles</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </div>
      <p className={styles.resultCount}>
        {resultCount} user{resultCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default UserToolbar;