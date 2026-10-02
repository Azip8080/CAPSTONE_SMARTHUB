import styles from "./ProjectSummary.module.css";

function ProjectSummary({
  summary = "",
}) {
  if (!summary) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            AI GENERATED
          </span>

          <h3>
            Project summary
          </h3>

          <p>
            Review the generated summary before
            saving or publishing the project.
          </p>
        </div>
      </div>

      <div className={styles.summaryBox}>
        <p>
          {summary}
        </p>
      </div>
    </section>
  );
}

export default ProjectSummary;