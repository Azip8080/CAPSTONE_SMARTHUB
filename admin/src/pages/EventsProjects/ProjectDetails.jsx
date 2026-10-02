import styles from "./ProjectDetails.module.css";

function ProjectDetails({
  project,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.heading}>
        <div>
          <h3>
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

      <section className={styles.section}>
        <h4>
          Description
        </h4>

        <p className={styles.description}>
          {project.description}
        </p>
      </section>

      <section className={styles.section}>
        <h4>
          Barangay
        </h4>

        <p className={styles.location}>
          {project.barangay}
        </p>
      </section>

      {project.tags?.length > 0 && (
        <section className={styles.section}>
          <h4>
            Project tags
          </h4>

          <div className={styles.tags}>
            {project.tags.map(
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
        </section>
      )}
    </div>
  );
}

export default ProjectDetails;