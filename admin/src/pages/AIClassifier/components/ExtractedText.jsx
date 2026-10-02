import { useMemo } from "react";
import styles from "./ClassificationResult.module.css";

function HighlightedText({ text, matches = [] }) {
  const segments = useMemo(() => {
    if (!text || !Array.isArray(matches) || matches.length === 0) {
      return [
        {
          text: text || "",
          highlighted: false,
        },
      ];
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
      .sort(
        (a, b) =>
          a.start - b.start ||
          b.end - a.end
      );

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
            title={`${segment.sdg || ""}: ${
              segment.keyword || ""
            }`}
          >
            {segment.text}
          </mark>
        ) : (
          <span key={`text-${index}`}>
            {segment.text}
          </span>
        )
      )}
    </div>
  );
}

function ExtractedText({
  extractedText,
  allMatches,
}) {
  return (
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
        <HighlightedText
          text={extractedText}
          matches={allMatches}
        />
      ) : (
        <p className={styles.noEvidence}>
          No extracted text is available for this result.
        </p>
      )}
    </div>
  );
}

export default ExtractedText;