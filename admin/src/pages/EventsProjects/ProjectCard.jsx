import { useState } from "react";
import styles from "./ProjectCard.module.css";
import Modal from "./Modal.jsx";
import ProjectDetails from "./ProjectDetails.jsx";

function ProjectCard({
  project,
  onEdit,
  onDelete,
}) {
  const [showDetails, setShowDetails] =
    useState(false);

  return (
    <>
      <article className={styles.card}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>
              {project.title}
            </h3>

            <span className={styles.sdg}>
              {project.sdgTag}
            </span>
          </div>

          <span className={styles.status}>
            {project.status}
          </span>
        </div>

        <p className={styles.description}>
          {project.description}
        </p>

        <button
          type="button"
          className={styles.viewBtn}
          onClick={() =>
            setShowDetails(true)
          }
        >
          View details
        </button>

        <div className={styles.details}>
          <span>
            {project.barangay}
          </span>

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

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() =>
              onEdit(project)
            }
          >
            Edit
          </button>

          <button
            type="button"
            onClick={() =>
              onDelete(project._id)
            }
          >
            Delete
          </button>
        </div>
      </article>

      {showDetails && (
        <Modal
          title="Project details"
          onClose={() =>
            setShowDetails(false)
          }
        >
          <ProjectDetails
            project={project}
          />
        </Modal>
      )}
    </>
  );
}

export default ProjectCard;