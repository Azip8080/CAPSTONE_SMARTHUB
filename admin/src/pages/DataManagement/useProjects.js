import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../../services/api";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterSDG, setFilterSDG] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get("/projects")
      .then((data) => setProjects(data.data ?? data))
      .catch((e) => setError(e.message))
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
      const matchSearch =
        p.title.toLowerCase().includes(q) || p.barangay.toLowerCase().includes(q);
      const matchSDG = filterSDG === "All" || p.sdgTag === filterSDG;
      const matchStatus = filterStatus === "All" || p.status === filterStatus;
      return matchSearch && matchSDG && matchStatus;
    });
  }, [projects, search, filterSDG, filterStatus]);

  return {
    projects,
    filteredProjects,
    loading,
    error,
    search,
    setSearch,
    filterSDG,
    setFilterSDG,
    filterStatus,
    setFilterStatus,
    createProject,
    updateProject,
    deleteProject,
  };
}