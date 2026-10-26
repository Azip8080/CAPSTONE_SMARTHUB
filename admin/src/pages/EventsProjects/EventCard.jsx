
import styles from "./Card.module.css";
import { SDG_COLORS } from "./Constants.js";

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

function EventCard({ event, onEdit, onDelete }) {
  const color = SDG_COLORS[event.sdgTag] || "#888";

  const date = event.date ? new Date(event.date) : null;

  const document = event.document;

  const documentPath =
    document?.path ||
    document?.url ||
    document?.filename ||
    "";

  const documentUrl = documentPath
    ? /^https?:\/\//i.test(documentPath)
      ? documentPath
      : `${API_BASE}/${documentPath.replace(/^\/+/, "")}`
    : "";

  return (
    <div
      className={styles.card}
      style={{ borderTop: `3px solid ${color}` }}
    >
      <div className={styles.cardHeader}>
        <span
          className={styles.sdgChip}
          style={{ background: color }}
        >
          {event.sdgTag}
        </span>

        {date && !Number.isNaN(date.getTime()) && (
          <span className={styles.dateChip}>
            {date.toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      <h3 className={styles.cardTitle}>
        {event.title}
      </h3>

      <p className={styles.cardBarangay}>
        📍 {event.location}
      </p>

      <p className={styles.cardDesc}>
        {event.description}
      </p>

      <div className={styles.documentSection}>
        <p>
          <strong>Event Document</strong>
        </p>

        {documentUrl ? (
          <>
            <p>
              📄{" "}
              {document?.originalName ||
                document?.filename ||
                "Event document"}
            </p>

            <a
              href={documentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewDocumentBtn}
            >
              View Document
            </a>
          </>
        ) : (
          <p>No document uploaded.</p>
        )}
      </div>

      <div className={styles.cardActions}>
        <button
          type="button"
          className={styles.editBtn}
          onClick={() => onEdit(event)}
        >
          Edit
        </button>

        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => onDelete(event._id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default EventCard;