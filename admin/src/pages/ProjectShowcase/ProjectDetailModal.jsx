import styles from "./ProjectDetailModal.module.css";
import { SDG_COLORS, STATUS_STYLES } from "./constants.js";

function ProjectDetailModal({ project, onClose, onFeatureToggle }) {
  if (!project) return null;

  const color = SDG_COLORS[project.sdgTag] || "#0f172a";
  const status = STATUS_STYLES[project.status] || STATUS_STYLES.Planned;

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader} style={{ borderTop: `4px solid ${color}` }}>
          <div className={styles.modalHeaderTop}>
            <div className={styles.modalBadges}>
              <span className={styles.sdgBadge} style={{ background: color }}>
                {project.sdgTag}
              </span>
              <span className={styles.statusBadge} style={{ background: status.bg, color: status.color }}>
                {project.status}
              </span>
              {project.featured && <span className={styles.featuredBadge}> Featured</span>}
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              ✕
            </button>
          </div>
          <h2 className={styles.modalTitle}>{project.title}</h2>
          <p className={styles.modalBarangay}> {project.barangay}</p>
        </div>
        <div className={styles.modalBody}>
          <p className={styles.modalDesc}>{project.description}</p>
          <div className={styles.modalActions}>
            <button
              className={project.featured ? styles.unfeatureBtn : styles.featureBtn}
              onClick={() => onFeatureToggle(project)}
            >
              {project.featured ? "★ Remove from showcase" : "☆ Add to showcase"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailModal;