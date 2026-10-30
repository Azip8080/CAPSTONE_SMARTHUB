
import styles from "./ArticleCard.module.css";
import { getSdgInfo } from "./constants.js";
import { getFileUrl } from "../../utils/fileUrl";

function formatUploadDate(article) {
  const uploadedAt = article.createdAt || article.uploadedAt;

  if (!uploadedAt) return "Upload date unavailable";

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

function getResourceLabel(type) {
  const labels = {
    uploaded: "File Resource",
    youtube: "YouTube Video",
    shorts: "YouTube Shorts",
    article: "Article Link",
  };

  return labels[type] || "Knowledge Resource";
}

function ArticleCard({ article, onView, onEdit, onDelete }) {
  const sdg = getSdgInfo(article.sdgTag);

  const photos = Array.isArray(article.photos)
    ? article.photos
    : [];

  const firstPhoto = photos[0];
  const photoUrl = firstPhoto
    ? getFileUrl(firstPhoto)
    : article.thumbnailUrl || "";

  return (
    <div
      className={styles.card}
      onClick={() => onView(article)}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onView(article);
        }
      }}
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

      <div
        style={{
          padding: "0 16px",
          marginTop: "10px",
        }}
      >
        <span
          style={{
            display: "inline-block",
            fontSize: "11px",
            fontWeight: 700,
            padding: "5px 9px",
            borderRadius: "20px",
            background: "#eef2ff",
            color: "#3730a3",
          }}
        >
          {getResourceLabel(article.resourceType)}
        </span>
      </div>

      {photoUrl ? (
        <img
          className={styles.cardImage}
          src={photoUrl}
          alt={article.title || "Knowledge resource"}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = "none";
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
          {article.summary || article.content || "No description available."}
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
