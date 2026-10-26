
import styles from "./ProjectDetails.module.css";
import { getFileUrl } from "../../utils/fileUrl";

function ProjectDetails({ project }) {
  if (!project) {
    return null;
  }

  const photos = Array.isArray(project.photos)
    ? project.photos
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <div>
          <h3>{project.title}</h3>

          <span className={styles.sdg}>
            {project.sdgTag}
          </span>
        </div>

        <span className={styles.status}>
          {project.status || project.publicationStatus || "Draft"}
        </span>
      </div>

      {/* Project photos */}
      <section className={styles.section}>
        <h4>Project Photos</h4>

        {photos.length > 0 ? (
          <div className={styles.photoGrid}>
            {photos.map((photo, index) => {
              const photoUrl = getFileUrl(photo);

              return (
                <div
                  key={`${photo}-${index}`}
                  className={styles.photoWrapper}
                >
                  <img
                    className={styles.projectPhoto}
                    src={photoUrl}
                    alt={`${project.title || "Project"} - photo ${index + 1}`}
                    loading="lazy"
                    onError={(event) => {
                      console.error(
                        "Project details image failed to load:",
                        {
                          storedPath: photo,
                          resolvedUrl: photoUrl,
                        }
                      );
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <p className={styles.emptyPhotos}>
            No project photos available.
          </p>
        )}
      </section>

      {/* Description */}
      <section className={styles.section}>
        <h4>Description</h4>

        <p className={styles.description}>
          {project.description || "No description provided."}
        </p>
      </section>

      {/* Barangay */}
      <section className={styles.section}>
        <h4>Barangay</h4>

        <p className={styles.location}>
          {project.barangay || "Not specified"}
        </p>
      </section>

      {/* Project tags */}
      {Array.isArray(project.tags) && project.tags.length > 0 && (
        <section className={styles.section}>
          <h4>Project Tags</h4>

          <div className={styles.tags}>
            {project.tags.map((tag, index) => (
              <span
                key={`${tag}-${index}`}
                className={styles.tag}
              >
                {tag}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* SDG tags, if available */}
      {Array.isArray(project.sdgTags) && project.sdgTags.length > 0 && (
        <section className={styles.section}>
          <h4>Related SDGs</h4>

          <div className={styles.tags}>
            {project.sdgTags.map((tag, index) => (
              <span
                key={`${typeof tag === "string" ? tag : index}-${index}`}
                className={styles.tag}
              >
                {typeof tag === "string"
                  ? tag
                  : tag.label || tag.name || tag.title || tag.value || tag.sdgTag || `SDG ${index + 1}`}
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ProjectDetails;