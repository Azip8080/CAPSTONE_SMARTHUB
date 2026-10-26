
import { useState } from "react";
import styles from "./ProjectCard.module.css";
import Modal from "./Modal.jsx";
import ProjectDetails from "./ProjectDetails.jsx";
import { getFileUrl } from "../../utils/fileUrl";

function ProjectCard({ project, onEdit, onDelete }) {
  const [showDetails, setShowDetails] = useState(false);

  const photos = Array.isArray(project?.photos)
    ? project.photos
    : [];

  const photo = photos[0];
  const photoUrl = photo ? getFileUrl(photo) : "";

  return (
    <>
      <article className={styles.card}>
        {/* Project photo */}
        <div className={styles.imageContainer}>
          {photoUrl ? (
            <img
              className={styles.projectImage}
              src={photoUrl}
              alt={project.title || "Project photo"}
              loading="eager"
              onLoad={() => {
                console.log("Project Showcase image loaded:", photoUrl);
              }}
              onError={(event) => {
                console.error("Project Showcase image failed:", {
                  storedPath: photo,
                  resolvedUrl: photoUrl,
                });
              }}
            />
          ) : (
            <div className={styles.imagePlaceholder}>
              No project photo available
            </div>
          )}
        </div>

        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>{project.title}</h3>
            <span className={styles.sdg}>{project.sdgTag}</span>
          </div>

          <span className={styles.status}>
            {project.status || project.publicationStatus || "Draft"}
          </span>
        </div>

        <p className={styles.description}>
          {project.description}
        </p>

        <button
          type="button"
          className={styles.viewBtn}
          onClick={() => setShowDetails(true)}
        >
          View details
        </button>

        <div className={styles.details}>
          <span>{project.barangay}</span>

          {Array.isArray(project.tags) && project.tags.length > 0 && (
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
          )}
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => onEdit(project)}
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() => onDelete(project._id)}
          >
            Delete
          </button>
        </div>
      </article>

      {showDetails && (
        <Modal
          title="Project details"
          onClose={() => setShowDetails(false)}
        >
          <ProjectDetails project={project} />
        </Modal>
      )}
    </>
  );
}

export default ProjectCard;