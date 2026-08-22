import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../../services/api";

export function useShowcaseProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sdgFilter, setSdgFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [view, setView] = useState("all"); // "all" | "featured"

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

  const toggleFeatured = useCallback(
    async (project) => {
      await api.put(`/projects/${project._id}`, { ...project, featured: !project.featured });
      load();
    },
    [load]
  );

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase();
    return projects.filter((p) => {
      const matchSearch = p.title?.toLowerCase().includes(q) || p.barangay?.toLowerCase().includes(q);
      const matchSdg = sdgFilter === "All" || p.sdgTag === sdgFilter;
      const matchStatus = statusFilter === "All" || p.status === statusFilter;
      const matchView = view === "all" || (view === "featured" && p.featured);
      return matchSearch && matchSdg && matchStatus && matchView;
    });
  }, [projects, search, sdgFilter, statusFilter, view]);

  const featuredCount = useMemo(() => projects.filter((p) => p.featured).length, [projects]);

  return {
    loading,
    search,
    setSearch,
    sdgFilter,
    setSdgFilter,
    statusFilter,
    setStatusFilter,
    view,
    setView,
    filteredProjects,
    featuredCount,
    toggleFeatured,
  };
}