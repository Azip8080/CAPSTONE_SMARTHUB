import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../../services/api";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/events")
      .then((d) => setEvents(d.data ?? d))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createEvent = useCallback(
    async (form) => {
      await api.post("/events", form);
      load();
    },
    [load]
  );

  const updateEvent = useCallback(
    async (id, form) => {
      await api.put(`/events/${id}`, form);
      load();
    },
    [load]
  );

  const deleteEvent = useCallback(
    async (id) => {
      await api.delete(`/events/${id}`);
      load();
    },
    [load]
  );

  const filteredEvents = useMemo(() => {
    const q = search.toLowerCase();
    return events.filter((e) => e.title?.toLowerCase().includes(q) || e.location?.toLowerCase().includes(q));
  }, [events, search]);

  return {
    loading,
    search,
    setSearch,
    filteredEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}