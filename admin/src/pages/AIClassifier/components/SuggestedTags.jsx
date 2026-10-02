import { useState } from "react";
import styles from "./ClassificationResult.module.css";

function SuggestedTags({
  automaticTags,
  selectedTags,
  primaryColor,
  onToggleTag,
  onAddTag,
  onRemoveTag,
}) {
  const [newTag, setNewTag] = useState("");

  function handleAddTag() {
    const trimmedTag = newTag.trim();

    if (!trimmedTag) return;

    if (onAddTag) {
      onAddTag(trimmedTag);
    }

    setNewTag("");
  }

  return (
    <div
      id="panel-tags"
      role="tabpanel"
      aria-labelledby="tab-tags"
      className={styles.tabPanel}
    >
      <div className={styles.panelHeading}>
        <div>
          <h3>Review project tags</h3>

          <p>
            Select the tags that accurately describe the project. You can
            remove suggestions or add your own tag.
          </p>
        </div>

        <span className={styles.countBadge}>
          {selectedTags.length} selected
        </span>
      </div>

      {automaticTags.length > 0 && (
        <div className={styles.alternativesList}>
          {automaticTags.map((item, index) => {
            const tag = item.tag || item.name;
            const score = item.score;
            const isSelected = selectedTags.includes(tag);

            return (
              <div
                className={styles.alternativeItem}
                key={`${tag}-${index}`}
              >
                <span
                  className={styles.alternativeDot}
                  style={{
                    backgroundColor: isSelected
                      ? primaryColor
                      : "#cbd5e1",
                  }}
                />

                <div className={styles.alternativeInfo}>
                  <strong>{tag}</strong>

                  {Array.isArray(item.matchedKeywords) &&
                    item.matchedKeywords.length > 0 && (
                      <span>
                        Detected from:{" "}
                        {item.matchedKeywords.join(", ")}
                      </span>
                    )}
                </div>

                {score !== undefined && score !== null && (
                  <span className={styles.alternativeScore}>
                    {score} matches
                  </span>
                )}

                {onToggleTag && (
                  <button
                    type="button"
                    className={styles.smallButton}
                    onClick={() => onToggleTag(tag)}
                  >
                    {isSelected ? "Remove" : "Add"}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className={styles.panelHeading}>
        <div>
          <h3>Selected tags</h3>

          <p>
            These are the tags that will be included when the project is
            saved or published.
          </p>
        </div>
      </div>

      {selectedTags.length > 0 ? (
        <div className={styles.keywordChips}>
          {selectedTags.map((tag, index) => (
            <div
              className={styles.keywordChip}
              key={`${tag}-${index}`}
            >
              <strong>{tag}</strong>

              {onRemoveTag && (
                <button
                  type="button"
                  className={styles.textButton}
                  onClick={() => onRemoveTag(tag)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.noEvidence}>
          No tags selected yet.
        </p>
      )}

      <div className={styles.panelHeading}>
        <div>
          <h3>Add custom tag</h3>

          <p>
            Add a project tag that was not detected automatically.
          </p>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          alignItems: "center",
          marginTop: "12px",
        }}
      >
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddTag();
            }
          }}
          placeholder="Enter a project tag"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "10px 12px",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
          }}
        />

        <button
          type="button"
          className={styles.smallButton}
          onClick={handleAddTag}
          disabled={!newTag.trim()}
        >
          Add Tag
        </button>
      </div>

      {automaticTags.length === 0 && (
        <p className={styles.noEvidence}>
          No automatic project tags were detected. You can add your own
          tags above.
        </p>
      )}
    </div>
  );
}

export default SuggestedTags;