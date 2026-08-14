	import styles from "./Card.module.css";
import { SDG_COLORS } from "./constants.js";

function EventCard({ event, onEdit, onDelete }) {
  const color = SDG_COLORS[event.sdgTag] || "#888";
  const date = event.date ? new Date(event.date) : null;

  return (
    <div className={styles.card} style={{ borderTop: `3px solid ${color}` }}>
      <div className={styles.cardHeader}>
        <span className={styles.sdgChip} style={{ background: color }}>
          {event.sdgTag}
        </span>
        {date && (
          <span className={styles.dateChip}>
            {date.toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        )}
      </div>
      <h3 className={styles.cardTitle}>{event.title}</h3>
      <p className={styles.cardBarangay}>📍 {event.location}</p>
      <p className={styles.cardDesc}>{event.description}</p>
      <div className={styles.cardActions}>
        <button className={styles.editBtn} onClick={() => onEdit(event)}>
          Edit
        </button>
        <button className={styles.deleteBtn} onClick={() => onDelete(event._id)}>
          Delete
        </button>
      </div>
    </div>
  );
}

export default EventCard;