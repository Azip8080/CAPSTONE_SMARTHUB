import styles from "./EventDetailsModal.module.css";

function EventDetailsModal({
  event,
  onClose,
}) {
  if (!event) {
    return null;
  }

  const date = new Date(event.date);

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(e) =>
          e.stopPropagation()
        }
      >
        <div className={styles.header}>
          <div>
            <p className={styles.label}>
              Event Details
            </p>

            <h2 className={styles.title}>
              {event.title}
            </h2>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className={styles.dateBox}>
          <span className={styles.day}>
            {date.getDate()}
          </span>

          <span className={styles.month}>
            {date.toLocaleString(
              "default",
              {
                month: "long",
              }
            )}
          </span>

          <span className={styles.year}>
            {date.getFullYear()}
          </span>
        </div>

        <div className={styles.details}>
          <div className={styles.detail}>
            <span className={styles.detailLabel}>
              Location
            </span>

            <span className={styles.detailValue}>
              {event.location || "—"}
            </span>
          </div>

          {event.description && (
            <div
              className={`${styles.detail} ${styles.description}`}
            >
              <span
                className={
                  styles.detailLabel
                }
              >
                Description
              </span>

              <p
                className={
                  styles.descriptionText
                }
              >
                {event.description}
              </p>
            </div>
          )}

          {event.sdgTag && (
            <div className={styles.detail}>
              <span
                className={
                  styles.detailLabel
                }
              >
                SDG
              </span>

              <span className={styles.tag}>
                {event.sdgTag}
              </span>
            </div>
          )}

          {event.category && (
            <div className={styles.detail}>
              <span
                className={
                  styles.detailLabel
                }
              >
                Category
              </span>

              <span className={styles.detailValue}>
                {event.category}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetailsModal;