import { useState } from "react";

import styles from "./TabToolbar.module.css";
import { useEvents } from "./useEvents.js";
import EventCard from "./EventCard.jsx";
import Modal from "./Modal.jsx";
import EventForm from "./EventForm.jsx";

function EventsTab() {
  const {
    loading,
    search,
    setSearch,
    filteredEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  } = useEvents();

  const [editingEvent, setEditingEvent] =
    useState(null);

  const openAdd = () =>
    setEditingEvent({});

  const openEdit = (event) =>
    setEditingEvent(event);

  const closeForm = () =>
    setEditingEvent(null);

  const handleDelete = async (id) => {
    if (!confirm("Delete this event?")) {
      return;
    }

    await deleteEvent(id);
  };

  const handleFormSubmit = async (form) => {
    if (editingEvent?._id) {
      await updateEvent(
        editingEvent._id,
        form
      );
    } else {
      await createEvent(form);
    }

    closeForm();
  };

  return (
    <div>
      <div className={styles.tabToolbar}>
        <div className={styles.toolbarLeft}>
          <input
            className={styles.search}
            placeholder="Search events…"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <button
          className={styles.addBtn}
          onClick={openAdd}
        >
          + Add event
        </button>
      </div>

      <p className={styles.resultCount}>
        {filteredEvents.length} event
        {filteredEvents.length !== 1
          ? "s"
          : ""}
      </p>

      {loading && (
        <p className={styles.empty}>
          Loading…
        </p>
      )}

      {!loading &&
        filteredEvents.length === 0 && (
          <p className={styles.empty}>
            No events found.
          </p>
        )}

      <div className={styles.cardGrid}>
        {filteredEvents.map((event) => (
          <EventCard
            key={event._id}
            event={event}
            onEdit={openEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {editingEvent && (
        <Modal
          title={
            editingEvent._id
              ? "Edit event"
              : "Add event"
          }
          onClose={closeForm}
        >
          <EventForm
            initialData={
              editingEvent._id
                ? {
                    title:
                      editingEvent.title,
                    description:
                      editingEvent.description,
                    sdgTag:
                      editingEvent.sdgTag,
                    date:
                      editingEvent.date,
                    location:
                      editingEvent.location,
                  }
                : null
            }
            onClose={closeForm}
            onSubmit={handleFormSubmit}
          />
        </Modal>
      )}
    </div>
  );
}

export default EventsTab;