
import styles from "./ArticleCard.module.css";
import { getSdgInfo } from "./constants.js";
import { getFileUrl } from "../../utils/fileUrl";

function formatUploadDate(article) {
  const uploadedAt = article.createdAt || article.uploadedAt;

  if (!uploadedAt) {
    return "Upload date unavailable";
  }

  const date = new Date(uploadedAt);

  if (Number.isNaN(date.getTime())) {
    return "Upload date unavailable";
  }

  return date.toLocaleDateString("en-PH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function ArticleCard({ article, onView, onEdit, onDelete }) {
  const sdg = getSdgInfo(article.sdgTag);

  const photos = Array.isArray(article.photos)
    ? article.photos
    : [];

  const firstPhoto = photos[0];
  const photoUrl = firstPhoto ? getFileUrl(firstPhoto) : "";

  return (
    <div
      className={styles.card}
      onClick={() => onView(article)}
    >
      <div
        className={styles.cardTop}
        style={{
          borderTop: `3px solid ${sdg?.color || "#e2e8f0"}`,
        }}
      >
        <div className={styles.cardBadges}>
          <span
            className={styles.sdgChip}
            style={{ background: sdg?.color || "#888" }}
          >
            {article.sdgTag}
          </span>

          <span className={styles.catChip}>
            {article.category}
          </span>
        </div>
      </div>

      {photoUrl ? (
        <img
          className={styles.cardImage}
          src={photoUrl}
          alt={article.title || "Knowledge resource"}
          loading="lazy"
          onError={(event) => {
            console.error("Article card image failed to load:", {
              storedPath: firstPhoto,
              resolvedUrl: photoUrl,
              actualUrl: event.currentTarget.currentSrc,
            });
          }}
        />
      ) : (
        <div className={styles.cardImagePlaceholder}>
          No photo
        </div>
      )}

      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{article.title}</h3>

        <p className={styles.uploadDate}>
          <span>Uploaded:</span> {formatUploadDate(article)}
        </p>

        <p className={styles.cardContent}>
          {article.content}
        </p>

        <div className={styles.cardFooter}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={(event) => {
              event.stopPropagation();
              onEdit(article);
            }}
          >
            Edit
          </button>

          <button
            type="button"
            className={styles.deleteBtn}
            onClick={(event) => {
              event.stopPropagation();
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