import styles from "./RangeToolbar.module.css";
import { RANGE_OPTIONS } from "./constants.js";

function RangeToolbar({ range, onChange }) {
  return (
    <div className={styles.toolbar}>
      <label className={styles.toolbarLabel} htmlFor="reportRange">
        Period
      </label>
      <select
        id="reportRange"
        className={styles.select}
        value={range}
        onChange={(e) => onChange(e.target.value)}
      >
        {RANGE_OPTIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default RangeToolbar;