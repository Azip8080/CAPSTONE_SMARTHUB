import styles from "./SDGRelevance.module.css";

function SDGRelevance({
  sdgRelevance = [],
}) {
  if (!sdgRelevance.length) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          ◎
        </div>

        <h3>
          No SDG relevance found
        </h3>

        <p>
          No SDG relevance explanation
          was generated for this project.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            AI ANALYSIS
          </span>

          <h3>
            SDG relevance
          </h3>

          <p>
            Review how the project connects
            to the Sustainable Development Goals.
          </p>
        </div>

        <div className={styles.countBadge}>
          {sdgRelevance.length}
          <span>SDGs</span>
        </div>
      </div>

      <div className={styles.sdgList}>
        {sdgRelevance.map((item, index) => (
          <article
            className={styles.sdgCard}
            key={item.sdg}
          >
            <div className={styles.cardHeader}>
              <div className={styles.sdgNumber}>
                {item.sdg.replace("SDG ", "")}
              </div>

              <div className={styles.sdgTitle}>
                <span>
                  {item.sdg}
                </span>

                <h4>
                  {item.name}
                </h4>
              </div>

              <div className={styles.rank}>
                #{index + 1}
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>
                  ✦
                </span>

                <strong>
                  Why this project is relevant
                </strong>
              </div>

              <p className={styles.explanation}>
                {item.explanation}
              </p>
            </div>

            {item.matchedKeywords
              ?.length > 0 && (
              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>
                    #
                  </span>

                  <strong>
                    Supporting keywords
                  </strong>
                </div>

                <div className={styles.keywordList}>
                  {item.matchedKeywords.map(
                    (keyword) => (
                      <span
                        className={styles.keyword}
                        key={keyword}
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}

            {item.evidence
              ?.length > 0 && (
              <div className={styles.evidence}>
                <div className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>
                    ◈
                  </span>

                  <strong>
                    Evidence
                  </strong>
                </div>

                <div className={styles.evidenceList}>
                  {item.evidence.map(
                    (
                      evidence,
                      evidenceIndex
                    ) => (
                      <div
                        className={
                          styles.evidenceItem
                        }
                        key={`${item.sdg}-${evidenceIndex}`}
                      >
                        <span
                          className={
                            styles.evidenceMarker
                          }
                        />

                        <p>
                          {evidence}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

export default SDGRelevance;