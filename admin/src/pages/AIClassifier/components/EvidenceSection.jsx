import { useState } from "react";
import { SDG_COLORS, SDG_NAMES } from "../sdgConstants";
import styles from "./EvidenceSection.module.css";

function getSDGName(tag) {
  return SDG_NAMES?.[tag] || tag || "Unknown SDG";
}

function getSDGColor(tag) {
  return SDG_COLORS?.[tag] || "#64748b";
}

function EvidenceSection({
  keywordGroups = [],
  evidenceBySDG = {},
  totalMatches = 0,
}) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showAllMatches, setShowAllMatches] = useState(false);

  function toggleGroup(tag) {
    setExpandedGroups((previous) => ({
      ...previous,
      [tag]: !(previous[tag] ?? false),
    }));
  }

  return (
    <div
      id="panel-evidence"
      role="tabpanel"
      aria-labelledby="tab-evidence"
      className={styles.evidenceSection}
    >
      <div className={styles.evidenceHeader}>
        <div>
          <h3 className={styles.evidenceTitle}>
            Keyword Evidence
          </h3>
          <p className={styles.evidenceDescription}>
            Review the keywords detected for each Sustainable
            Development Goal and the text supporting each match.
          </p>
        </div>

        <span className={styles.matchBadge}>
          {totalMatches} matches
        </span>
      </div>

      <div className={styles.evidenceNotice}>
        <span className={styles.noticeIcon} aria-hidden="true">
          i
        </span>
        <span>
          Keyword matches are supporting evidence for review,
          not proof that a project directly addresses an SDG.
        </span>
      </div>

      {keywordGroups.length > 0 ? (
        <>
          <div className={styles.evidenceList}>
            {keywordGroups
              .slice(0, showAllMatches ? undefined : 4)
              .map(([tag, matches]) => {
                const isExpanded = expandedGroups[tag] ?? false;

                const evidence = Array.isArray(evidenceBySDG?.[tag])
                  ? evidenceBySDG[tag]
                  : [];

                return (
                  <div
                    className={`${styles.evidenceCard} ${
                      isExpanded ? styles.evidenceCardOpen : ""
                    }`}
                    key={tag}
                  >
                    <button
                      type="button"
                      className={styles.evidenceToggle}
                      onClick={() => toggleGroup(tag)}
                      aria-expanded={isExpanded}
                    >
                      <span
                        className={styles.sdgMarker}
                        style={{
                          backgroundColor: getSDGColor(tag),
                        }}
                      >
                        {String(tag).match(/\d+/)?.[0] || "SDG"}
                      </span>

                      <span className={styles.sdgInfo}>
                        <span className={styles.sdgLabel}>
                          Sustainable Development Goal
                        </span>
                        <span className={styles.sdgName}>
                          {getSDGName(tag)}
                        </span>
                      </span>

                      <span className={styles.sdgMatchCount}>
                        {matches.length}
                      </span>

                      <span
                        className={styles.evidenceChevron}
                        aria-hidden="true"
                      >
                        {isExpanded ? "−" : "+"}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className={styles.evidenceDetails}>
                        <div className={styles.detailsDivider} />

                        <div>
                          <p className={styles.detailsHeading}>
                            Matched keywords
                          </p>

                          <div className={styles.keywordList}>
                            {matches.map((match, index) => {
                              const keyword =
                                match.matchedText ||
                                match.keyword ||
                                "";

                              return (
                                <span
                                  className={styles.keywordTag}
                                  key={`${match.keyword}-${match.start}-${index}`}
                                  title={`Keyword: ${match.keyword || ""}`}
                                >
                                  {keyword}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        {matches.some(
                          (_, index) => evidence[index]?.context
                        ) && (
                          <div>
                            <p className={styles.detailsHeading}>
                              Supporting text
                            </p>

                            <div className={styles.keywordList}>
                              {matches.map((match, index) => {
                                const context =
                                  evidence[index]?.context || "";

                                if (!context) return null;

                                return (
                                  <div
                                    className={styles.contextBlock}
                                    key={`${match.keyword}-${match.start}-${index}-context`}
                                  >
                                    {context}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          <div className={styles.evidenceFooter}>
            <span className={styles.evidenceTotal}>
              Showing{" "}
              {Math.min(
                showAllMatches ? keywordGroups.length : 4,
                keywordGroups.length
              )}{" "}
              of {keywordGroups.length} SDGs
            </span>

            {keywordGroups.length > 4 && (
              <button
                type="button"
                className={styles.showMoreButton}
                onClick={() =>
                  setShowAllMatches((previous) => !previous)
                }
              >
                {showAllMatches
                  ? "Show fewer SDGs"
                  : `Show all ${keywordGroups.length} SDGs`}
              </button>
            )}
          </div>
        </>
      ) : (
        <p className={styles.emptyEvidence}>
          No keyword evidence was returned for this analysis.
        </p>
      )}
    </div>
  );
}

export default EvidenceSection;