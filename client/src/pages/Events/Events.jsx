import { useState, useEffect } from "react";
import styles from "./Events.module.css";
import EventCalendar from "./components/EventCalendar";
import EventList from "./components/EventList";
import { fetchEvents } from "../../services/eventService";

const SDG_FILTERS = [
  "All",
  "SDG 1",
  "SDG 2",
  "SDG 3",
  "SDG 4",
  "SDG 5",
  "SDG 6",
  "SDG 7",
  "SDG 8",
  "SDG 9",
  "SDG 10",
  "SDG 11",
  "SDG 12",
  "SDG 13",
  "SDG 14",
  "SDG 15",
  "SDG 16",
  "SDG 17",
];

function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetchEvents()
      .then(setEvents)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const sdgFilteredEvents = events.filter((event) => {
    return (
      activeFilter === "All" ||
      event.sdgTag === activeFilter
    );
  });

  const filteredEvents = sdgFilteredEvents
    .filter((event) => {
      const eventDate = new Date(event.date);

      if (selectedDate) {
        return (
          eventDate.toDateString() ===
          selectedDate.toDateString()
        );
      }

      return eventDate >= new Date();
    })
    .sort(
      (a, b) =>
        new Date(a.date) -
        new Date(b.date)
    );

  return (
    <main className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Events
        </h1>

        <p className={styles.heroSubtitle}>
          Discover and join SDG-related events
          and activities happening across Manila.
        </p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarInner}>
          <span className={styles.toolbarLabel}>
            Filter by goal
          </span>

          <select
            className={styles.select}
            value={activeFilter}
            onChange={(e) =>
              setActiveFilter(e.target.value)
            }
          >
            {SDG_FILTERS.map((filter) => (
              <option
                key={filter}
                value={filter}
              >
                {filter}
              </option>
            ))}
          </select>

          {selectedDate && (
            <button
              className={styles.clearBtn}
              onClick={() =>
                setSelectedDate(null)
              }
            >
              ✕ Clear date
            </button>
          )}
        </div>
      </div>

      <div className={styles.layout}>
        <EventCalendar
          events={sdgFilteredEvents}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <EventList
          events={filteredEvents}
          loading={loading}
          error={error}
          selectedDate={selectedDate}
          onClearDate={() =>
            setSelectedDate(null)
          }
        />
      </div>
    </main>
  );
}

export default Events;