import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../../services/api";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const load = useCallback(() => {
    setLoading(true);
    api
      .get("/projects")
      .then((d) => setProjects(d.data ?? d))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createProject = useCallback(
    async (form) => {
      await api.post("/projects", form);
      load();
    },
    [load]
  );

  const updateProject = useCallback(
    async (id, form) => {
      await api.put(`/projects/${id}`, form);
      load();
    },
    [load]
  );

  const deleteProject = useCallback(
    async (id) => {
      await api.delete(`/projects/${id}`);
      load();
    },
    [load]
  );

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const matchSearch = p.title?.toLowerCase().includes(q) || p.barangay?.toLowerCase().includes(q);
      const matchFilter = filter === "All" || p.status === filter;
      return matchSearch && matchFilter;
    });
  }, [projects, search, filter]);

  return {
    loading,
    search,
    setSearch,
    filter,
    setFilter,
    filteredProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}