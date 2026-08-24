import styles from "./KnowledgeToolbar.module.css";
import { SDG_OPTIONS, CATEGORIES } from "./constants.js";

function KnowledgeToolbar({ search, onSearch, sdgFilter, onSdgFilter, catFilter, onCatFilter, resultCount }) {
  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarLeft}>
        <input
          className={styles.search}
          placeholder="Search articles…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
        <select className={styles.select} value={sdgFilter} onChange={(e) => onSdgFilter(e.target.value)}>
          <option value="All">All SDGs</option>
          {SDG_OPTIONS.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
        <select className={styles.select} value={catFilter} onChange={(e) => onCatFilter(e.target.value)}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <p className={styles.resultCount}>
        {resultCount} article{resultCount !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default KnowledgeToolbar;