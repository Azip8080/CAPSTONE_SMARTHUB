import styles from "./ViewToggle.module.css";

function ViewToggle({ view, onChange, featuredCount }) {
  return (
    <div className={styles.viewToggle}>
      <button className={`${styles.viewBtn} ${view === "all" ? styles.activeView : ""}`} onClick={() => onChange("all")}>
        All projects
      </button>
      <button
        className={`${styles.viewBtn} ${view === "featured" ? styles.activeView : ""}`}
        onClick={() => onChange("featured")}
      >
         Featured ({featuredCount})
      </button>
    </div>
  );
}

export default ViewToggle;