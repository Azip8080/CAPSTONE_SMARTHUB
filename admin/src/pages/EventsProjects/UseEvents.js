
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { api } from "../../services/api";

export function useEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sdgFilter, setSdgFilter] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/events");
      const data = response.data ?? response;

      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const buildFormData = (form) => {
    const formData = new FormData();

    formData.append("title", form.title || "");
    formData.append("description", form.description || "");
    formData.append("sdgTag", form.sdgTag || "");
    formData.append("date", form.date || "");
    formData.append("location", form.location || "");

    if (form.document instanceof File) {
      formData.append("document", form.document);
    }

    return formData;
  };

  const createEvent = useCallback(
    async (form) => {
      await api.postForm("/events", buildFormData(form));
      await load();
    },
    [load]
  );

  const updateEvent = useCallback(
    async (id, form) => {
      await api.putForm(
        `/events/${id}`,
        buildFormData(form)
      );
      await load();
    },
    [load]
  );

  const deleteEvent = useCallback(
    async (id) => {
      await api.delete(`/events/${id}`);
      await load();
    },
    [load]
  );

  const filteredEvents = useMemo(() => {
    const query = search.toLowerCase();

    return events.filter((event) => {
      const matchesSearch =
        event.title?.toLowerCase().includes(query) ||
        event.location?.toLowerCase().includes(query);

      const matchesSdg =
        sdgFilter === "All" ||
        event.sdgTag === sdgFilter;

      return matchesSearch && matchesSdg;
    });
  }, [events, search, sdgFilter]);

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
    reloadEvents: load,
  };
}