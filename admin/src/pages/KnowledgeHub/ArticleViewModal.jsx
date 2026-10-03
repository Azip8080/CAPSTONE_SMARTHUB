import styles from "./ArticleViewModal.module.css";
import { getSdgInfo } from "./constants.js";

function ArticleViewModal({
  article,
  onEdit,
  onDelete,
}) {
  const sdg = getSdgInfo(
    article.sdgTag
  );

  return (
    <div className={styles.viewBody}>
      <div className={styles.viewBadges}>
        <span
          className={styles.sdgChip}
          style={{
            background:
              sdg.color || "#888",
          }}
        >
          {article.sdgTag}
        </span>

        <span className={styles.catChip}>
          {article.category}
        </span>

        <span className={styles.sdgName}>
          {sdg.label}
        </span>
      </div>

      {article.photos?.length > 0 && (
        <img
          className={styles.viewImage}
          src={`http://localhost:5000${article.photos[0]}`}
          alt={article.title}
        />
      )}

      <p className={styles.viewContent}>
        {article.content}
      </p>

      <div className={styles.viewActions}>
        <button
          className={styles.editBtn}
          onClick={() => onEdit(article)}
        >
          Edit
        </button>

        <button
          className={styles.deleteBtn}
          onClick={() =>
            onDelete(article._id)
          }
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default ArticleViewModal;