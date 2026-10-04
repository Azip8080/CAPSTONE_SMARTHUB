import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { api } from "../../services/api";

export function useEvents() {
  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [sdgFilter, setSdgFilter] =
    useState("All");

  const load = useCallback(() => {
    setLoading(true);

    api
      .get("/events")
      .then((data) =>
        setEvents(data.data ?? data)
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createEvent = useCallback(
    async (form) => {
      await api.post(
        "/events",
        form
      );

      load();
    },
    [load]
  );

  const updateEvent = useCallback(
    async (id, form) => {
      await api.put(
        `/events/${id}`,
        form
      );

      load();
    },
    [load]
  );

  const deleteEvent = useCallback(
    async (id) => {
      await api.delete(
        `/events/${id}`
      );

      load();
    },
    [load]
  );

  const filteredEvents =
    useMemo(() => {
      const query =
        search.toLowerCase();

      return events.filter((event) => {
        const matchSearch =
          event.title
            ?.toLowerCase()
            .includes(query) ||
          event.location
            ?.toLowerCase()
            .includes(query);

        const matchSDG =
          sdgFilter === "All" ||
          event.sdgTag === sdgFilter;

        return (
          matchSearch &&
          matchSDG
        );
      });
    }, [
      events,
      search,
      sdgFilter,
    ]);

  return {
    loading,
    search,
    setSearch,
    sdgFilter,
    setSdgFilter,
    filteredEvents,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}