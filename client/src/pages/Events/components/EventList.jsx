import { useState } from "react";
import styles from "./EventList.module.css";

const SDG_COLORS = {
  "SDG 1": "#E5243B", "SDG 2": "#DDA63A", "SDG 3": "#4C9F38",
  "SDG 4": "#C5192D", "SDG 5": "#FF3A21", "SDG 6": "#26BDE2",
  "SDG 7": "#FCC30B", "SDG 8": "#A21942", "SDG 9": "#FD6925",
  "SDG 10": "#DD1367", "SDG 11": "#FD9D24", "SDG 12": "#BF8B2E",
  "SDG 13": "#3F7E44", "SDG 14": "#0A97D9", "SDG 15": "#56C02B",
  "SDG 16": "#00689D", "SDG 17": "#19486A",
};

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString("en-PH", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatFullDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function EventModal({ event, onClose }) {
  if (!event) return null;
  const color = SDG_COLORS[event.sdgTag] || "#0f172a";

  return (
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader} style={{ borderTop: `4px solid ${color}` }}>
          <div>
            <p className={styles.modalDate}>{formatFullDate(event.date)}</p>
            <h2 className={styles.modalTitle}>{event.title}</h2>
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalMeta}>
            <span>🕐 {formatTime(event.date)}</span>
            <span>📍 {event.location}</span>
          </div>
          <p className={styles.modalDesc}>{event.description}</p>
          {event.sdgTag && (
            <span
              className={styles.sdgTag}
              style={{ background: color }}
            >
              {event.sdgTag}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function EventCard({ event, onClick }) {
  const color = SDG_COLORS[event.sdgTag] || "#0f172a";
  return (
    <button className={styles.card} onClick={() => onClick(event)}>
      <div className={styles.dateBlock}>
        <span className={styles.dateDay}>
          {new Date(event.date).getDate()}
        </span>
        <span className={styles.dateMonth}>
          {new Date(event.date).toLocaleString("default", { month: "short" })}
        </span>
      </div>
      <div className={styles.cardBody}>
        <h3 className={styles.cardTitle}>{event.title}</h3>
        <div className={styles.cardMeta}>
          <span>🕐 {formatTime(event.date)}</span>
          <span>📍 {event.location}</span>
        </div>
        {event.sdgTag && (
          <span className={styles.sdgTag} style={{ background: color }}>
            {event.sdgTag}
          </span>
        )}
      </div>
      <span className={styles.arrow}>›</span>
    </button>
  );
}

function EventList({ events, loading, error, selectedDate, onClearDate }) {
  const [selected, setSelected] = useState(null);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {selectedDate
            ? `Events — ${selectedDate.toLocaleDateString("en-PH", { month: "long", day: "numeric" })}`
            : "Upcoming Events"}
        </h2>
        {selectedDate && (
          <button className={styles.clearBtn} onClick={onClearDate}>
            Show all
          </button>
        )}
      </div>

      <div className={styles.listBox}>
        {loading && <p className={styles.status}>Loading events…</p>}
        {error   && <p className={styles.statusError}>{error}</p>}
        {!loading && !error && events.length === 0 && (
          <p className={styles.status}>No events found.</p>
        )}
        {events.map((event) => (
          <EventCard key={event._id} event={event} onClick={setSelected} />
        ))}
      </div>

      {events.length > 3 && (
        <p className={styles.scrollHint}>Scroll to see more events ↓</p>
      )}

      <EventModal event={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default EventList;