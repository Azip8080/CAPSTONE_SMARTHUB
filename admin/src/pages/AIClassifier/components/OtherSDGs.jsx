import { SDG_COLORS, SDG_NAMES } from "../sdgConstants";
import styles from "./ClassificationResult.module.css";

function getSDGName(tag) {
  return SDG_NAMES?.[tag] || tag || "Unknown SDG";
}

function getSDGColor(tag) {
  return SDG_COLORS?.[tag] || "#64748b";
}

function formatConfidence(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) return "N/A";

  return `${Math.round(number <= 1 ? number * 100 : number)}%`;
}

function OtherSDGs({
  relatedSDGs,
  alternatives,
  primaryTag,
  onUseResult,
}) {
  const displayRelated = relatedSDGs.length > 0
    ? relatedSDGs
    : alternatives.filter(
        (item) => item.tag !== primaryTag
      );

  return (
    <div
      id="panel-alternatives"
      role="tabpanel"
      aria-labelledby="tab-alternatives"
      className={styles.tabPanel}
    >
      <div className={styles.panelHeading}>
        <div>
          <h3>Related SDGs</h3>

          <p>
            Review other SDGs identified from the project content before
            choosing the project's final SDG tag.
          </p>
        </div>
      </div>

      {displayRelated.length > 0 ? (
        <div className={styles.alternativesList}>
          {displayRelated.map((item, index) => {
            const tag =
              item.tag ||
              item.label ||
              item.name;

            const score =
              item.confidence ??
              item.score ??
              item.probability;

            return (
              <div
                className={styles.alternativeItem}
                key={`${tag}-${index}`}
              >
                <span
                  className={styles.alternativeDot}
                  style={{
                    backgroundColor: getSDGColor(tag),
                  }}
                />

                <div className={styles.alternativeInfo}>
                  <strong>{tag}</strong>

                  <span>{getSDGName(tag)}</span>
                </div>

                {score !== undefined && score !== null && (
                  <span className={styles.alternativeScore}>
                    {formatConfidence(score)}
                  </span>
                )}

                {onUseResult && (
                  <button
                    type="button"
                    className={styles.smallButton}
                    onClick={() => onUseResult(tag)}
                  >
                    Select
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className={styles.noEvidence}>
          No related SDGs were returned.
        </p>
      )}
    </div>
  );
}

export default OtherSDGs;