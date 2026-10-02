import { SDG_NAMES } from "../sdgConstants";
import styles from "./ClassificationResult.module.css";

function getSDGName(tag) {
  return SDG_NAMES?.[tag] || tag || "Unknown SDG";
}

function ClassificationSummary({
  totalMatches,
  keywordGroupsCount,
  relatedSDGsCount,
  selectedTagsCount,
  extractedTextAvailable,
  textTruncated,
}) {
  return (
    <aside className={styles.summaryCard}>
      <h3>Analysis summary</h3>

      <p className={styles.summaryDescription}>
        Review the evidence found in the uploaded content.
      </p>

      <div className={styles.summaryMetric}>
        <span className={styles.metricIcon}>⌕</span>

        <div>
          <strong>{totalMatches}</strong>
          <span>Keyword matches</span>
        </div>
      </div>

      <div className={styles.summaryMetric}>
        <span className={styles.metricIcon}>◎</span>

        <div>
          <strong>{keywordGroupsCount}</strong>
          <span>SDGs with evidence</span>
        </div>
      </div>

      <div className={styles.summaryMetric}>
        <span className={styles.metricIcon}>◆</span>

        <div>
          <strong>{relatedSDGsCount}</strong>
          <span>Related SDGs</span>
        </div>
      </div>

      <div className={styles.summaryMetric}>
        <span className={styles.metricIcon}>✦</span>

        <div>
          <strong>{selectedTagsCount}</strong>
          <span>Selected tags</span>
        </div>
      </div>

      <div className={styles.summaryMetric}>
        <span className={styles.metricIcon}>▤</span>

        <div>
          <strong>
            {extractedTextAvailable ? "Available" : "Unavailable"}
          </strong>

          <span>Extracted document text</span>
        </div>
      </div>

      {textTruncated && (
        <p className={styles.warningNote}>
          Only part of the document was analyzed.
        </p>
      )}
    </aside>
  );
}

export default ClassificationSummary;