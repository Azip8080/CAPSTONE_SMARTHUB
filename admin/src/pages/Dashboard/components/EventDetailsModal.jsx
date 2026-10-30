
import styles from "./EventDetailsModal.module.css";

function EventDetailsModal({ event, onClose }) {
  if (!event) return null;

  const date = event.date ? new Date(event.date) : null;
  const validDate =
    date && !Number.isNaN(date.getTime());

  const sdg = Array.isArray(event.sdgTags)
    ? event.sdgTags
    : event.sdgTag
      ? [event.sdgTag]
      : [];

  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  return (
    <div
      className={styles.overlay}
      onMouseDown={handleOverlayClick}
      role="presentation"
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-modal-title"
      >
        <header className={styles.header}>
          <div className={styles.headerIcon}>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 10h18" />
            </svg>
          </div>

          <div className={styles.headerText}>
            <span className={styles.eyebrow}>
              EVENT DETAILS
            </span>
            <h2 id="event-modal-title" className={styles.title}>
              {event.title || "Untitled event"}
            </h2>
            <p className={styles.headerSubtitle}>
              Community event information
            </p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close event details"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m18 6-12 12M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className={styles.body}>
          {validDate && (
            <div className={styles.dateCard}>
              <div className={styles.dateBlock}>
                <span className={styles.dateDay}>
                  {date.getDate()}
                </span>
                <span className={styles.dateMonth}>
                  {date.toLocaleString("en-US", {
                    month: "short",
                  }).toUpperCase()}
                </span>
              </div>

              <div className={styles.dateInfo}>
                <strong>
                  {date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </strong>
                <span>{date.getFullYear()}</span>
              </div>

              <span className={styles.dateIcon}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  aria-hidden="true"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18m5 5 2 2 4-4" />
                </svg>
              </span>
            </div>
          )}

          <div className={styles.details}>
            <div className={styles.detail}>
              <span className={styles.detailIcon}>
                <svg viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="1.8"
                  aria-hidden="true">
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>
              </span>
              <div className={styles.detailContent}>
                <span className={styles.detailLabel}>
                  LOCATION
                </span>
                <p className={styles.detailValue}>
                  {event.location || event.barangay || "Location not specified"}
                </p>
              </div>
            </div>

            {event.description && (
              <div className={styles.detail}>
                <span className={styles.detailIcon}>
                  <svg viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8"
                    aria-hidden="true">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
                    <path d="M14 2v6h6M8 13h8M8 17h8" />
                  </svg>
                </span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>
                    DESCRIPTION
                  </span>
                  <p className={styles.descriptionText}>
                    {event.description}
                  </p>
                </div>
              </div>
            )}

            {sdg.length > 0 && (
              <div className={styles.detail}>
                <span className={styles.detailIcon}>
                  <svg viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8"
                    aria-hidden="true">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 1v3m0 16v3M1 12h3m16 0h3" />
                  </svg>
                </span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>
                    SUSTAINABLE DEVELOPMENT GOALS
                  </span>
                  <div className={styles.tags}>
                    {sdg.map((tag) => (
                      <span className={styles.tag} key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {event.category && (
              <div className={styles.detail}>
                <span className={styles.detailIcon}>
                  <svg viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.8"
                    aria-hidden="true">
                    <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8" />
                    <path d="M16 3h5v5m0-5-9 9" />
                  </svg>
                </span>
                <div className={styles.detailContent}>
                  <span className={styles.detailLabel}>
                    CATEGORY
                  </span>
                  <p className={styles.detailValue}>
                    {event.category}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          <span className={styles.footerNote}>
            SDG Smart Hub
          </span>
          <button
            type="button"
            className={styles.footerClose}
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </section>
    </div>
  );
}

export default EventDetailsModal;