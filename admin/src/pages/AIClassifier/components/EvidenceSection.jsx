import { useState } from "react";
import { SDG_COLORS, SDG_NAMES } from "../sdgConstants";
import styles from "./ClassificationResult.module.css";

function getSDGName(tag) {
  return SDG_NAMES?.[tag] || tag || "Unknown SDG";
}

function getSDGColor(tag) {
  return SDG_COLORS?.[tag] || "#64748b";
}

function EvidenceSection({
  keywordGroups,
  evidenceBySDG,
  totalMatches,
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
      className={styles.tabPanel}
    >
      <div className={styles.panelHeading}>
        <div>
          <h3>Keyword evidence</h3>

          <p>
            Expand an SDG to inspect the matched keywords and supporting
            text. A match is evidence to review, not proof of relevance.
          </p>
        </div>

        <span className={styles.countBadge}>
          {totalMatches} matches
        </span>
      </div>

      {keywordGroups.length > 0 ? (
        <>
          <div className={styles.keywordGroups}>
            {keywordGroups
              .slice(
                0,
                showAllMatches ? undefined : 4
              )
              .map(([tag, matches]) => {
                const isExpanded =
                  expandedGroups[tag] ?? false;

                const evidence = Array.isArray(
                  evidenceBySDG[tag]
                )
                  ? evidenceBySDG[tag]
                  : [];

                return (
                  <div
                    className={styles.keywordGroup}
                    key={tag}
                  >
                    <button
                      type="button"
                      className={styles.groupToggle}
                      onClick={() => toggleGroup(tag)}
                      aria-expanded={isExpanded}
                    >
                      <span
                        className={styles.alternativeDot}
                        style={{
                          backgroundColor:
                            getSDGColor(tag),
                        }}
                      />

                      <span className={styles.groupInfo}>
                        <strong>{tag}</strong>

                        <span>
                          {getSDGName(tag)}
                        </span>
                      </span>

                      <span className={styles.groupCount}>
                        {matches.length}
                      </span>

                      <span className={styles.chevron}>
                        {isExpanded ? "−" : "+"}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className={styles.keywordChips}>
                        {matches.map((match, index) => {
                          const evidenceItem =
                            evidence[index];

                          const context =
                            evidenceItem?.context || "";

                          return (
                            <div
                              className={
                                styles.keywordChip
                              }
                              key={`${match.keyword}-${match.start}-${index}`}
                              title={`Keyword: ${
                                match.keyword || ""
                              }`}
                            >
                              <strong>
                                {match.matchedText ||
                                  match.keyword}
                              </strong>

                              {context && (
                                <div>{context}</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {keywordGroups.length > 4 && (
            <button
              type="button"
              className={styles.textButton}
              onClick={() =>
                setShowAllMatches(
                  (previous) => !previous
                )
              }
            >
              {showAllMatches
                ? "Show fewer SDGs"
                : `Show all ${keywordGroups.length} SDGs`}
            </button>
          )}
        </>
      ) : (
        <p className={styles.noEvidence}>
          No keyword evidence was returned for this analysis.
        </p>
      )}
    </div>
  );
}

export default EvidenceSection;