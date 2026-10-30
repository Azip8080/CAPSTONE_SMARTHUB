
import { useEffect } from "react";
import styles from "./ProjectDetailsModal.module.css";

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

function getPhotoUrl(photo) {
  if (!photo) return "";

  if (/^https?:\/\//i.test(photo)) {
    return photo;
  }

  const baseUrl = API_BASE.replace(/\/$/, "");
  const path = photo.startsWith("/") ? photo : `/${photo}`;

  return `${baseUrl}${path}`;
}

function getStatusClass(status) {
  const normalized = String(status || "planned").toLowerCase();

  if (normalized === "completed") {
    return styles.completed;
  }

  if (normalized === "ongoing") {
    return styles.ongoing;
  }

  return styles.planned;
}

function ProjectDetailsModal({ project, onClose }) {
  useEffect(() => {
    if (!project) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [project, onClose]);

  if (!project) {
    return null;
  }

  const photos = Array.isArray(project.photos)
    ? project.photos.filter(Boolean)
    : [];

  const sdgTags = [
    ...new Set(
      [
        project.sdgTag,
        ...(Array.isArray(project.sdgTags)
          ? project.sdgTags
          : []),
      ].filter(Boolean)
    ),
  ];

  return (
    <div
      className={styles.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
      >
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
              <path d="m3.5 7.5 8.5 4.3 8.5-4.3M12 12v9" />
            </svg>
          </div>

          <div className={styles.headerText}>
            <p className={styles.eyebrow}>PROJECT OVERVIEW</p>

            <h2
              className={styles.title}
              id="project-modal-title"
            >
              {project.title || "Untitled Project"}
            </h2>

            <p className={styles.subtitle}>
              Project information and details
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close project details"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className={styles.body}>
          {/* Project Photos */}
          {photos.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <h3>Project Gallery</h3>
                <span className={styles.photoCount}>
                  {photos.length}{" "}
                  {photos.length === 1 ? "photo" : "photos"}
                </span>
              </div>

              <div className={styles.photos}>
                {photos.map((photo, index) => (
                  <a
                    key={`${photo}-${index}`}
                    href={getPhotoUrl(photo)}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.photoLink}
                    aria-label={`Open project photo ${index + 1}`}
                  >
                    <img
                      src={getPhotoUrl(photo)}
                      alt={`${project.title || "Project"} photo ${index + 1}`}
                      className={styles.photo}
                      loading="lazy"
                    />

                    <span className={styles.photoOverlay}>
                      View photo ↗
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Key Information */}
          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h3>Project Information</h3>
            </div>

            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>⌖</span>
                <div className={styles.infoContent}>
                  <span className={styles.detailLabel}>
                    BARANGAY
                  </span>
                  <span className={styles.detailValue}>
                    {project.barangay || "Not specified"}
                  </span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>◷</span>
                <div className={styles.infoContent}>
                  <span className={styles.detailLabel}>
                    PROJECT STATUS
                  </span>

                  <span
                    className={`${styles.status} ${getStatusClass(
                      project.status
                    )}`}
                  >
                    <span className={styles.statusDot} />
                    {project.status || "Planned"}
                  </span>
                </div>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>◎</span>
                <div className={styles.infoContent}>
                  <span className={styles.detailLabel}>
                    PRIMARY SDG
                  </span>

                  {project.sdgTag ? (
                    <span className={styles.primaryTag}>
                      {project.sdgTag}
                    </span>
                  ) : (
                    <span className={styles.detailValue}>
                      Not assigned
                    </span>
                  )}
                </div>
              </div>

              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>▤</span>
                <div className={styles.infoContent}>
                  <span className={styles.detailLabel}>
                    PUBLICATION
                  </span>

                  <span className={styles.detailValue}>
                    {project.publicationStatus || "Not specified"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* SDG Tags */}
          {sdgTags.length > 0 && (
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <h3>Related Sustainable Development Goals</h3>
              </div>

              <div className={styles.tags}>
                {sdgTags.map((tag) => (
                  <span key={tag} className={styles.tag}>
                    <span className={styles.tagDot} />
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Description */}
          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h3>About This Project</h3>
            </div>

            <div className={styles.descriptionCard}>
              <p className={styles.descriptionText}>
                {project.description ||
                  "No description has been provided for this project yet."}
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.footerText}>
            Project details
          </p>

          <button
            type="button"
            className={styles.footerClose}
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

export default ProjectDetailsModal;