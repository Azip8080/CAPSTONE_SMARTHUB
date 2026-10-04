import styles from "./ProjectModal.module.css";

const SDG_COLORS = {
  "SDG 1": "#E5243B",
  "SDG 2": "#DDA63A",
  "SDG 3": "#4C9F38",
  "SDG 4": "#C5192D",
  "SDG 5": "#FF3A21",
  "SDG 6": "#26BDE2",
  "SDG 7": "#FCC30B",
  "SDG 8": "#A21942",
  "SDG 9": "#FD6925",
  "SDG 10": "#DD1367",
  "SDG 11": "#FD9D24",
  "SDG 12": "#BF8B2E",
  "SDG 13": "#3F7E44",
  "SDG 14": "#0A97D9",
  "SDG 15": "#56C02B",
  "SDG 16": "#00689D",
  "SDG 17": "#19486A",
};

const STATUS_STYLES = {
  Planned: {
    bg: "#f1f5f9",
    color: "#475569",
  },
  Ongoing: {
    bg: "#dcfce7",
    color: "#166534",
  },
  Completed: {
    bg: "#dbeafe",
    color: "#1d4ed8",
  },
};

function ProjectModal({
  project,
  open,
  onClose,
}) {
  if (!open || !project) {
    return null;
  }

  const sdgs =
    Array.isArray(project.sdgTags) &&
    project.sdgTags.length > 0
      ? project.sdgTags
      : [project.sdgTag];

  const color =
    SDG_COLORS[project.sdgTag] ||
    "#0f172a";

  const status =
    STATUS_STYLES[project.status] ||
    STATUS_STYLES.Planned;

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div
          className={styles.modalHeader}
          style={{
            borderTop: `4px solid ${color}`,
          }}
        >
          <div className={styles.headerTop}>
            <div className={styles.badges}>
              {sdgs.map((sdg) => (
                <span
                  key={sdg}
                  className={styles.sdgBadge}
                  style={{
                    background:
                      SDG_COLORS[sdg] ||
                      "#0f172a",
                  }}
                >
                  {sdg}
                </span>
              ))}

              <span
                className={styles.statusBadge}
                style={{
                  background: status.bg,
                  color: status.color,
                }}
              >
                {project.status}
              </span>
            </div>

            <button
              className={styles.closeBtn}
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          <h2 className={styles.title}>
            {project.title}
          </h2>

          <p className={styles.barangay}>
            📍 {project.barangay}
          </p>
        </div>

        <div className={styles.modalBody}>
          {project.photos?.length > 0 ? (
            <div className={styles.photoGrid}>
              {project.photos.map(
                (photo, index) => (
                  <img
                    key={`${photo}-${index}`}
                    className={
                      styles.projectPhoto
                    }
                    src={`http://localhost:5000${photo}`}
                    alt={`${project.title} ${
                      index + 1
                    }`}
                  />
                )
              )}
            </div>
          ) : (
            <div
              className={
                styles.imagePlaceholder
              }
            >
              Project Photo
            </div>
          )}

          <p className={styles.description}>
            {project.description}
          </p>

          {project.tags?.length > 0 && (
            <div className={styles.tags}>
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className={styles.tag}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;