
import { useMemo, useState } from "react";
import { SDG_COLORS, SDG_NAMES } from "./sdgConstants";
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

function HighlightedText({ text, matches = [] }) {
  const segments = useMemo(() => {
    if (!text || !Array.isArray(matches) || matches.length === 0) {
      return [{ text: text || "", highlighted: false }];
    }

    const validMatches = matches
      .filter(
        (match) =>
          Number.isInteger(match.start) &&
          Number.isInteger(match.end) &&
          match.start >= 0 &&
          match.end > match.start &&
          match.end <= text.length
      )
      .sort((a, b) => a.start - b.start || b.end - a.end);

    const output = [];
    let position = 0;

    for (const match of validMatches) {
      if (match.start < position) continue;

      if (match.start > position) {
        output.push({
          text: text.slice(position, match.start),
          highlighted: false,
        });
      }

      output.push({
        text: text.slice(match.start, match.end),
        highlighted: true,
        keyword: match.keyword,
        sdg: match.sdg,
      });

      position = match.end;
    }

    if (position < text.length) {
      output.push({
        text: text.slice(position),
        highlighted: false,
      });
    }

    return output;
  }, [text, matches]);

  return (
    <div className={styles.extractedText}>
      {segments.map((segment, index) =>
        segment.highlighted ? (
          <mark
            key={`${segment.keyword}-${index}`}
            title={`${segment.sdg || ""}: ${segment.keyword || ""}`}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`text-${index}`}>{segment.text}</span>
        )
      )}
    </div>
  );
}

function ClassificationResult({
  result,
  loading,
  error,
  onUseResult,
  onReset,
}) {
  const [activeTab, setActiveTab] = useState("evidence");
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showAllMatches, setShowAllMatches] = useState(false);

  if (loading) {
    return (
      <section className={styles.resultCard} aria-live="polite">
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <h3>Analyzing document...</h3>
          <p>Extracting text and checking possible SDG connections.</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.resultCard} role="alert">
        <div className={styles.errorState}>
          <h3>Classification failed</h3>
          <p>{error}</p>
          {onReset && (
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={onReset}
            >
              Try again
            </button>
          )}
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className={styles.resultCard}>
        <div className={styles.emptyState}>
          <h3>Classification results</h3>
          <p>
            Submit a project title, description, or PDF/TXT file to see its
            suggested SDG and supporting evidence.
          </p>
        </div>
      </section>
    );
  }

  const primaryTag = result.tag || result.sdgTag || "Unknown SDG";
  const primaryName = getSDGName(primaryTag);
  const primaryColor = getSDGColor(primaryTag);

  const alternatives = Array.isArray(result.topMatches)
    ? result.topMatches.filter(
        (item) => item && (item.tag || item.label || item.name)
      )
    : [];

  const keywordData = result.keywordMatches || {};
  const groupedKeywords = keywordData.grouped || {};

  const keywordGroups = Object.entries(groupedKeywords)
    .filter(([, matches]) => Array.isArray(matches) && matches.length > 0)
    .sort(([, a], [, b]) => b.length - a.length);

  const allMatches = Array.isArray(keywordData.matches)
    ? keywordData.matches
    : [];

  const extractedText =
    typeof result.extractedText === "string" ? result.extractedText : "";

  const totalMatches =
    typeof keywordData.totalMatches === "number"
      ? keywordData.totalMatches
      : allMatches.length;

  const methodLabel =
    result.method === "huggingface"
      ? "AI model"
      : result.method === "keyword"
        ? "Keyword matching"
        : result.method || "Classification";

  const tabs = [
    {
      id: "evidence",
      label: "Evidence",
      count: totalMatches,
    },
    {
      id: "alternatives",
      label: "Other SDGs",
      count: alternatives.length,
    },
    {
      id: "text",
      label: "Extracted text",
      count: extractedText ? null : 0,
    },
  ];

  function toggleGroup(tag) {
    setExpandedGroups((previous) => ({
      ...previous,
      [tag]: !(previous[tag] ?? false),
    }));
  }

  return (
    <section className={styles.resultCard} aria-live="polite">
      <header className={styles.resultHeader}>
        <div className={styles.headingContent}>
          <p className={styles.eyebrow}>
            <span className={styles.statusDot} />
            Analysis complete
          </p>
          <h2>Classification results</h2>
          <p className={styles.resultDescription}>
            Review the suggested SDG before saving or publishing the project.
          </p>
        </div>

        {result.filename && (
          <span className={styles.fileBadge} title={result.filename}>
            <span aria-hidden="true">▤</span>
            <span>{result.filename}</span>
          </span>
        )}
      </header>

      <div className={styles.overviewGrid}>
        <article
          className={styles.primaryResult}
          style={{ "--sdg-color": primaryColor }}
        >
          <div className={styles.primaryResultTop}>
            <span className={styles.sdgBadge}>{primaryTag}</span>
            <span className={styles.methodBadge}>{methodLabel}</span>
          </div>

          <p className={styles.cardEyebrow}>Suggested primary goal</p>
          <h3>{primaryName}</h3>

          <div className={styles.confidenceSection}>
            <div className={styles.confidenceHeader}>
              <span>Classification score</span>
              <strong>{formatConfidence(result.confidence)}</strong>
            </div>
            <p className={styles.confidenceNote}>
              This score is a classification signal, not proof that the project
              belongs to this SDG.
            </p>
          </div>

          {onUseResult && (
            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => onUseResult(primaryTag)}
            >
              Use suggested SDG
              <span aria-hidden="true">→</span>
            </button>
          )}
        </article>

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
              <strong>{keywordGroups.length}</strong>
              <span>SDGs with evidence</span>
            </div>
          </div>

          <div className={styles.summaryMetric}>
            <span className={styles.metricIcon}>▤</span>
            <div>
              <strong>{extractedText ? "Available" : "Unavailable"}</strong>
              <span>Extracted document text</span>
            </div>
          </div>

          {result.textTruncated && (
            <p className={styles.warningNote}>
              Only part of the document was analyzed.
            </p>
          )}
        </aside>
      </div>

      <div className={styles.tabSection}>
        <div className={styles.tabHeader} role="tablist" aria-label="Analysis details">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`${styles.tabButton} ${
                activeTab === tab.id ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
              {tab.count !== null && (
                <span className={styles.tabCount}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        {activeTab === "evidence" && (
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
                  Expand an SDG to inspect the matched keywords. A match is
                  evidence to review, not proof of relevance.
                </p>
              </div>
              <span className={styles.countBadge}>{totalMatches} matches</span>
            </div>

            {keywordGroups.length > 0 ? (
              <>
                <div className={styles.keywordGroups}>
                  {keywordGroups
                    .slice(0, showAllMatches ? undefined : 4)
                    .map(([tag, matches]) => {
                      const isExpanded = expandedGroups[tag] ?? false;

                      return (
                        <div className={styles.keywordGroup} key={tag}>
                          <button
                            type="button"
                            className={styles.groupToggle}
                            onClick={() => toggleGroup(tag)}
                            aria-expanded={isExpanded}
                          >
                            <span
                              className={styles.alternativeDot}
                              style={{ backgroundColor: getSDGColor(tag) }}
                            />
                            <span className={styles.groupInfo}>
                              <strong>{tag}</strong>
                              <span>{getSDGName(tag)}</span>
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
                              {matches.map((match, index) => (
                                <span
                                  className={styles.keywordChip}
                                  key={`${match.keyword}-${match.start}-${index}`}
                                  title={`Keyword: ${match.keyword || ""}`}
                                >
                                  {match.matchedText || match.keyword}
                                </span>
                              ))}
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
                    onClick={() => setShowAllMatches((previous) => !previous)}
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
        )}

        {activeTab === "alternatives" && (
          <div
            id="panel-alternatives"
            role="tabpanel"
            aria-labelledby="tab-alternatives"
            className={styles.tabPanel}
          >
            <div className={styles.panelHeading}>
              <div>
                <h3>Alternative SDGs</h3>
                <p>
                  Compare other suggested goals before choosing the project's
                  final SDG tag.
                </p>
              </div>
            </div>

            {alternatives.length > 0 ? (
              <div className={styles.alternativesList}>
                {alternatives.map((item, index) => {
                  const tag = item.tag || item.label || item.name;
                  const score =
                    item.confidence ?? item.score ?? item.probability;

                  return (
                    <div
                      className={styles.alternativeItem}
                      key={`${tag}-${index}`}
                    >
                      <span
                        className={styles.alternativeDot}
                        style={{ backgroundColor: getSDGColor(tag) }}
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
                No alternative SDGs were returned.
              </p>
            )}
          </div>
        )}

        {activeTab === "text" && (
          <div
            id="panel-text"
            role="tabpanel"
            aria-labelledby="tab-text"
            className={styles.tabPanel}
          >
            <div className={styles.panelHeading}>
              <div>
                <h3>Extracted document text</h3>
                <p>
                  Inspect the text used for classification. Highlighted
                  sections indicate matched keyword evidence.
                </p>
              </div>
            </div>

            {extractedText ? (
              <HighlightedText text={extractedText} matches={allMatches} />
            ) : (
              <p className={styles.noEvidence}>
                No extracted text is available for this result.
              </p>
            )}
          </div>
        )}
      </div>

      <div className={styles.reviewNotice}>
        <span className={styles.reviewIcon}>!</span>
        <div>
          <strong>Administrator review required</strong>
          <p>
            Confirm the project's actual objectives and select the appropriate
            SDG before saving or publishing it.
          </p>
        </div>
      </div>

      {onReset && (
        <div className={styles.resultActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onReset}
          >
            Classify another project
          </button>
        </div>
      )}
    </section>
  );
}

export default ClassificationResult;