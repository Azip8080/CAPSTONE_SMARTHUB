import styles from "./ProjectCard.module.css";
import { SDG_COLORS, STATUS_STYLES } from "./constants.js";

function ProjectCard({ project, onView, onFeatureToggle }) {
  const color = SDG_COLORS[project.sdgTag] || "#0f172a";
  const status = STATUS_STYLES[project.status] || STATUS_STYLES.Planned;

  return (
    <div
      className={`${styles.card} ${project.featured ? styles.featuredCard : ""}`}
      onClick={() => onView(project)}
    >
      <div className={styles.cardImageArea} style={{ borderTop: `3px solid ${color}` }}>
        {project.featured && <span className={styles.featuredTag}>Featured</span>}
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardBadges}>
          <span className={styles.sdgChip} style={{ background: color }}>
            {project.sdgTag}
          </span>
          <span className={styles.statusChip} style={{ background: status.bg, color: status.color }}>
            {project.status}
          </span>
        </div>
        <h3 className={styles.cardTitle}>{project.title}</h3>
        <p className={styles.cardBarangay}>📍 {project.barangay}</p>
        <p className={styles.cardDesc}>{project.description}</p>
        <div className={styles.cardFooter}>
          <button
            className={project.featured ? styles.unfeatureSmallBtn : styles.featureSmallBtn}
            onClick={(e) => {
              e.stopPropagation();
              onFeatureToggle(project);
            }}
          >
            {project.featured ? "★ Remove" : "☆ Feature"}
          </button>
          <button className={styles.viewBtn2} onClick={() => onView(project)}>
            View details
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;