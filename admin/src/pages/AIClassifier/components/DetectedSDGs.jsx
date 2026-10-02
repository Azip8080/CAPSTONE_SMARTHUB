import styles from "./DetectedSDGs.module.css";

function DetectedSDGs({
  sdgTags = [],
  selectedSDGs = [],
  onToggleSDG,
}) {
  if (!sdgTags.length) {
    return null;
  }

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>
            AI SUGGESTIONS
          </span>

          <h3>
            Detected SDGs
          </h3>

          <p>
            Review and select the SDGs that
            best represent this project.
          </p>
        </div>

        <span className={styles.count}>
          {selectedSDGs.length} selected
        </span>
      </div>

      <div className={styles.list}>
        {sdgTags.map((item) => {
          const tag =
            typeof item === "string"
              ? item
              : item.tag;

          const name =
            typeof item === "string"
              ? ""
              : item.name || "";

          const selected =
            selectedSDGs.includes(tag);

          return (
            <button
              type="button"
              key={tag}
              className={`${styles.sdg} ${
                selected
                  ? styles.selected
                  : ""
              }`}
              onClick={() =>
                onToggleSDG(tag)
              }
              aria-pressed={selected}
            >
              <span
                className={
                  styles.checkbox
                }
              >
                {selected ? "✓" : ""}
              </span>

              <span
                className={styles.info}
              >
                <strong>
                  {tag}
                </strong>

                {name && (
                  <span>
                    {name}
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default DetectedSDGs;