import styles from "./ArticleCard.module.css";
import { getSdgInfo } from "./constants.js";

function ArticleCard({ article, onView, onEdit, onDelete }) {
  const sdg = getSdgInfo(article.sdgTag);

  return (
    <div className={styles.card} onClick={() => onView(article)}>
      <div className={styles.cardTop} style={{ borderTop: `3px solid ${sdg.color || "#e2e8f0"}` }}>
        <div className={styles.cardBadges}>
          <span className={styles.sdgChip} style={{ background: sdg.color || "#888" }}>
            {article.sdgTag}
          </span>
          <span className={styles.catChip}>{article.category}</span>
        </div>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{article.title}</h3>
        <p className={styles.cardContent}>{article.content}</p>
        <div className={styles.cardFooter}>
          <button
            className={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(article);
            }}
          >
            Edit
          </button>
          <button
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(article._id);
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default ArticleCard;