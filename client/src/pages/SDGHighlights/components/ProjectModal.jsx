import { useEffect, useState } from "react";
import styles from "./ProjectModal.module.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

function getPhotoUrl(photo) {
  if (!photo) return "";

  if (
    photo.startsWith("http://") ||
    photo.startsWith("https://")
  ) {
    return photo;
  }

  if (photo.startsWith("/")) {
    return `${API_URL.replace("/api", "")}${photo}`;
  }

  return photo;
}

function ProjectModal({
  project,
  open,
  onClose,
}) {
  const [selectedPhoto, setSelectedPhoto] =
    useState(null);

  useEffect(() => {
    if (!project) return;

    const photos = Array.isArray(
      project.photos
    )
      ? project.photos
      : [];

    setSelectedPhoto(
      photos.length > 0
        ? photos[0]
        : null
    );
  }, [project]);

  useEffect(() => {
    if (!project || !open) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [project, open, onClose]);

  if (!open || !project) {
    return null;
  }

  const photos = Array.isArray(
    project.photos
  )
    ? project.photos
    : [];

  const sdgs =
    Array.isArray(project.sdgTags) &&
    project.sdgTags.length > 0
      ? project.sdgTags
      : project.sdgTag
        ? [project.sdgTag]
        : [];

  const tags = Array.isArray(
    project.tags
  )
    ? project.tags
    : [];

  return (
    <div
      className={styles.backdrop}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close project"
        >
          ×
        </button>

        <div className={styles.header}>
          <div className={styles.sdgList}>
            {sdgs.map((sdg) => (
              <span
                key={sdg}
                className={styles.sdgBadge}
              >
                {sdg}
              </span>
            ))}
          </div>

          <span
            className={`${styles.status} ${
              styles[
                project.status?.toLowerCase()
              ]
            }`}
          >
            {project.status}
          </span>

          <h2 className={styles.title}>
            {project.title}
          </h2>

          <div className={styles.location}>
            <span>📍</span>
            <span>
              {project.barangay}
            </span>
          </div>
        </div>

        <div className={styles.gallery}>
          <div className={styles.mainPhoto}>
            {selectedPhoto ? (
              <img
                src={getPhotoUrl(
                  selectedPhoto
                )}
                alt={project.title}
              />
            ) : (
              <div
                className={
                  styles.photoPlaceholder
                }
              >
                No project photo
              </div>
            )}
          </div>

          {photos.length > 1 && (
            <div className={styles.thumbnails}>
              {photos.map(
                (photo, index) => (
                  <button
                    type="button"
                    key={`${photo}-${index}`}
                    className={`${styles.thumbnail} ${
                      selectedPhoto === photo
                        ? styles.activeThumbnail
                        : ""
                    }`}
                    onClick={() =>
                      setSelectedPhoto(
                        photo
                      )
                    }
                  >
                    <img
                      src={getPhotoUrl(
                        photo
                      )}
                      alt={`Project photo ${
                        index + 1
                      }`}
                    />
                  </button>
                )
              )}
            </div>
          )}
        </div>

        <div className={styles.body}>
          <section className={styles.section}>
            <h3>
              Project Description
            </h3>

            <p>
              {project.description ||
                "No project description available."}
            </p>
          </section>

          {tags.length > 0 && (
            <section
              className={
                styles.section
              }
            >
              <h3>Tags</h3>

              <div
                className={styles.tags}
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={styles.tag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectModal;