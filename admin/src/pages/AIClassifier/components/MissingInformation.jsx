import styles from "./ClassificationResult.module.css";

function MissingInformation({
  missingInformation,
}) {
  if (!missingInformation) {
    return null;
  }

  const {
    missing = [],
    missingCount = 0,
    complete = false,
  } = missingInformation;

  return (
    <div
      id="panel-missing"
      role="tabpanel"
      aria-labelledby="tab-missing"
      className={styles.tabPanel}
    >
      <div className={styles.panelHeading}>
        <div>
          <h3>Missing information</h3>

          <p>
            Review information that may need to be added
            before the project is submitted.
          </p>
        </div>

        <span className={styles.countBadge}>
          {missingCount} missing
        </span>
      </div>

      {complete ? (
        <div className={styles.noEvidence}>
          <strong>Project information appears complete.</strong>

          <p>
            The submitted content contains the
            required project information.
          </p>
        </div>
      ) : (
        <div className={styles.keywordGroups}>
          {missing.map((item) => (
            <div
              className={styles.keywordGroup}
              key={item.key}
            >
              <div className={styles.groupToggle}>
                <span
                  className={styles.alternativeDot}
                  style={{
                    backgroundColor: "#f59e0b",
                  }}
                />

                <span className={styles.groupInfo}>
                  <strong>{item.label}</strong>

                  <span>
                    This information may need to be added.
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MissingInformation;