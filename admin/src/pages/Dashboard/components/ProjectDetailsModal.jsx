import styles from "./ProjectDetailsModal.module.css";

function ProjectDetailsModal({
  project,
  onClose,
}) {
  if (!project) {
    return null;
  }

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div className={styles.header}>
          <div>
            <p className={styles.label}>
              Project Details
            </p>

            <h2 className={styles.title}>
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {project.photos?.length > 0 && (
          <div className={styles.photos}>
            {project.photos.map(
              (photo, index) => (
                <img
                  key={`${photo}-${index}`}
                  src={`http://localhost:5000${photo}`}
                  alt={`${project.title} ${
                    index + 1
                  }`}
                  className={styles.photo}
                />
              )
            )}
          </div>
        )}

        <div className={styles.details}>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>
              Barangay
            </span>

            <span className={styles.detailValue}>
              {project.barangay || "—"}
            </span>
          </div>

          <div className={styles.detail}>
            <span className={styles.detailLabel}>
              Status
            </span>

            <span
              className={`${styles.status} ${
                styles[
                  project.status?.toLowerCase()
                ]
              }`}
            >
              {project.status || "—"}
            </span>
          </div>

          <div className={styles.detail}>
            <span className={styles.detailLabel}>
              Primary SDG
            </span>

            <span className={styles.detailValue}>
              {project.sdgTag || "—"}
            </span>
          </div>

          {project.sdgTags?.length > 0 && (
            <div className={styles.detail}>
              <span
                className={
                  styles.detailLabel
                }
              >
                SDG Tags
              </span>

              <div className={styles.tags}>
                {project.sdgTags.map(
                  (tag) => (
                    <span
                      key={tag}
                      className={styles.tag}
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          <div
            className={`${styles.detail} ${styles.description}`}
          >
            <span
              className={
                styles.detailLabel
              }
            >
              Description
            </span>

            <p
              className={
                styles.descriptionText
              }
            >
              {project.description ||
                "No description available."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProjectDetailsModal;