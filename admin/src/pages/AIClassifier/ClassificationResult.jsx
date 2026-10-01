import { SDG_COLORS, SDG_NAMES } from "./sdgConstants";
import styles from "./ClassificationResult.module.css";

function ClassificationResult({
  result,
  loading,
  error,
  onUseResult,
  onReset,
}) {
  if (loading) {
    return (
      <section className={styles.card}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>ANALYSIS</span>
            <h2>Classification results</h2>
          </div>
        </div>

        <div className={styles.state}>
          <div className={styles.spinner} />
          <h3>Analyzing your content</h3>
          <p>
            The classifier is evaluating the submitted text
            against the 17 Sustainable Development Goals.
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.card}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>ANALYSIS</span>
            <h2>Classification results</h2>
          </div>
        </div>

        <div className={styles.errorBox}>
          <strong>Classification failed</strong>
          <p>{error}</p>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={onReset}
          >
            Try again
          </button>
        </div>
      </section>
    );
  }

  if (!result) {
    return (
      <section className={styles.card}>
        <div className={styles.heading}>
          <div>
            <span className={styles.eyebrow}>ANALYSIS</span>
            <h2>Classification results</h2>
          </div>
          <span className={styles.step}>02</span>
        </div>

        <div className={styles.state}>
          <div className={styles.emptyIcon}>
            <div className={styles.document}>
              <span />
              <span />
              <span />
            </div>
            <span className={styles.sparkle}>✦</span>
          </div>

          <h3>Ready to analyze</h3>
          <p>
            Your predicted SDG, relevance score, and alternative
            matches will appear here after classification.
          </p>

          <div className={styles.steps}>
            <span>01 Enter details</span>
            <span>02 Analyze</span>
            <span>03 Review results</span>
          </div>
        </div>
      </section>
    );
  }

  const primaryColor = SDG_COLORS[result.tag] || "#3478f6";
  const confidence = Number(result.confidence);
  const confidencePct = Number.isFinite(confidence)
    ? Math.round(Math.max(0, Math.min(1, confidence)) * 100)
    : 0;

  const alternatives = (result.topMatches || [])
    .filter((match) => match.tag !== result.tag)
    .slice(0, 2);

  const methodLabel = {
    huggingface: "Hugging Face NLP",
    keyword: "Keyword matching",
    default: "No confident match",
  }[result.method] || result.method || "Unknown";

  return (
    <section className={styles.card}>
      <div className={styles.heading}>
        <div>
          <span className={styles.eyebrow}>ANALYSIS COMPLETE</span>
          <h2>Classification results</h2>
        </div>
        <span className={styles.complete}>✓ Complete</span>
      </div>

      {result.filename && (
        <div className={styles.fileInfo}>
          <span>▤</span>
          <span>{result.filename}</span>
        </div>
      )}

      <div
        className={styles.primaryResult}
        style={{ "--sdg-color": primaryColor }}
      >
        <div className={styles.sdgSymbol}>
          {result.tag?.replace("SDG ", "") || "?"}
        </div>

        <div className={styles.primaryText}>
          <span className={styles.resultLabel}>PREDICTED SDG</span>
          <h3>{result.tag || "Unknown SDG"}</h3>
          <p>{SDG_NAMES[result.tag] || "Review classification"}</p>
        </div>
      </div>

      <div className={styles.scoreSection}>
        <div className={styles.scoreHeader}>
          <span>Model score</span>
          <strong>{confidencePct}%</strong>
        </div>

        <div
          className={styles.scoreTrack}
          role="progressbar"
          aria-label="Model score"
          aria-valuenow={confidencePct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={styles.scoreFill}
            style={{
              width: `${confidencePct}%`,
              background: primaryColor,
            }}
          />
        </div>

        <p className={styles.disclaimer}>
          This score is a model output, not a guarantee that the
          classification is correct. Scores from different
          classification methods may not be directly comparable.
        </p>
      </div>

      <div className={styles.methodRow}>
        <span>Classification method</span>
        <span className={styles.methodBadge}>{methodLabel}</span>
      </div>

      <div className={styles.alternatives}>
        <h3>Other possible matches</h3>
        <p className={styles.description}>
          Review these alternatives before selecting the final SDG.
        </p>

        {alternatives.length > 0 ? (
          alternatives.map((match) => {
            const matchColor = SDG_COLORS[match.tag] || "#64748b";
            const score = Number(match.score);

            return (
              <div className={styles.matchRow} key={match.tag}>
                <span
                  className={styles.matchIcon}
                  style={{ background: matchColor }}
                >
                  {match.tag?.replace("SDG ", "")}
                </span>

                <div className={styles.matchName}>
                  <strong>{match.tag}</strong>
                  <span>
                    {SDG_NAMES[match.tag] || match.label || ""}
                  </span>
                </div>

                <span className={styles.matchScore}>
                  {result.method === "keyword"
                    ? `${match.score} matches`
                    : `${Math.round(Number(match.score) * 100)}%`}
                </span>
              </div>
            );
          })
        ) : (
          <p className={styles.noAlternatives}>
            No additional matches were returned.
          </p>
        )}
      </div>

      <div className={styles.actions}>
        {onUseResult && (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={() => onUseResult(result.tag)}
          >
            Use {result.tag} <span>→</span>
          </button>
        )}

        <button
          type="button"
          className={styles.secondaryButton}
          onClick={onReset}
        >
          Analyze another project
        </button>
      </div>
    </section>
  );
}

export default ClassificationResult;