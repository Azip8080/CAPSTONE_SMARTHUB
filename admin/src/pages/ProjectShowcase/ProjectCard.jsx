
import styles from "./ProjectCard.module.css";
import {
  SDG_COLORS,
  STATUS_STYLES,
} from "./constants.js";
import { getFileUrl } from "../../utils/fileUrl";

function ProjectCard({
  project,
  onView,
  onFeatureToggle,
}) {
  const color =
    SDG_COLORS[project.sdgTag] || "#0f172a";

  const status =
    STATUS_STYLES[project.status] ||
    STATUS_STYLES.Planned;

  const uploadedAt =
    project.createdAt || project.uploadedAt;

  const uploadDate = uploadedAt
    ? new Date(uploadedAt)
    : null;

  const validUploadDate =
    uploadDate &&
    !Number.isNaN(uploadDate.getTime());

  // Use the actual photo field supplied by your API.
  const photo =
    project.photos?.[0] ||
    project.photo ||
    project.image ||
    project.imageUrl ||
    "";

  const photoUrl = photo ? getFileUrl(photo) : "";

  return (
    <div
      className={`${styles.card} ${
        project.featured ? styles.featuredCard : ""
      }`}
      onClick={() => onView(project)}
    >
      <div
        className={styles.cardImageArea}
        style={{ borderTop: `3px solid ${color}` }}
      >
        {photoUrl ? (
          <img
            className={styles.projectImage}
            src={photoUrl}
            alt={`${project.title} project`}
            onError={(event) => {
              console.error("Project Showcase image failed:", {
                photo,
                photoUrl,
              });
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            No project photo
          </div>
        )}

        {project.featured && (
          <span className={styles.featuredTag}>
            Featured
          </span>
        )}
      </div>

      <div className={styles.cardBody}>
        <div className={styles.cardBadges}>
          <span
            className={styles.sdgChip}
            style={{ background: color }}
          >
            {project.sdgTag}
          </span>

          <span
            className={styles.statusChip}
            style={{
              background: status.bg,
              color: status.color,
            }}
          >
            {project.status}
          </span>
        </div>

        <h3 className={styles.cardTitle}>
          {project.title}
        </h3>

        <p className={styles.cardBarangay}>
          📍 {project.barangay}
        </p>

        <p className={styles.uploadDate}>
          📅 Uploaded:{" "}
          {validUploadDate
            ? uploadDate.toLocaleDateString("en-PH", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })
            : "Date unavailable"}
        </p>

        <p className={styles.cardDesc}>
          {project.description}
        </p>

        <div className={styles.cardFooter}>
          <button
            type="button"
            className={
              project.featured
                ? styles.unfeatureSmallBtn
                : styles.featureSmallBtn
            }
            onClick={(e) => {
              e.stopPropagation();
              onFeatureToggle(project);
            }}
          >
            {project.featured ? "★ Remove" : "☆ Feature"}
          </button>

          <button
            type="button"
            className={styles.viewBtn2}
            onClick={(e) => {
              e.stopPropagation();
              onView(project);
            }}
          >
            View details
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;