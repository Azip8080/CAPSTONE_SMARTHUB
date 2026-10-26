
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { api } from "../../services/api";

export function useShowcaseProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [sdgFilter, setSdgFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [view, setView] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/projects/admin/all");
      const data = response.data ?? response;

      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load projects:", error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateProject = useCallback(
    async (id, form) => {
      const formData = new FormData();

      formData.append("title", form.title || "");
      formData.append("description", form.description || "");
      formData.append("sdgTag", form.sdgTag || "");
      formData.append("barangay", form.barangay || "");
      formData.append("status", form.status || "");

      formData.append(
        "sdgTags",
        JSON.stringify(form.sdgTags || [])
      );

      formData.append(
        "tags",
        JSON.stringify(form.tags || [])
      );

      const photos = Array.isArray(form.photos)
        ? form.photos
        : [];

      const existingPhotos = photos.filter(
        (photo) => typeof photo === "string"
      );

      formData.append(
        "existingPhotos",
        JSON.stringify(existingPhotos)
      );

      photos
        .filter((photo) => photo instanceof File)
        .forEach((photo) => {
          formData.append("photos", photo);
        });

      await api.putForm(`/projects/${id}`, formData);
      await load();
    },
    [load]
  );

  const toggleFeatured = useCallback(
    async (project) => {
      await api.patch(
        `/projects/${project._id}/featured`,
        {
          featured: !project.featured,
        }
      );

      await load();
    },
    [load]
  );

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase();

    const now = new Date();

    const daysByFilter = {
      Weekly: 7,
      Monthly: 30,
      Quarterly: 90,
    };

    return projects.filter((project) => {
      const sdgs =
        Array.isArray(project.sdgTags) &&
        project.sdgTags.length > 0
          ? project.sdgTags
          : [project.sdgTag];

      const matchSearch =
        project.title?.toLowerCase().includes(query) ||
        project.barangay?.toLowerCase().includes(query);

      const matchSdg =
        sdgFilter === "All" ||
        sdgs.includes(sdgFilter);

      const matchStatus =
        statusFilter === "All" ||
        project.status === statusFilter;

      const matchView =
        view === "all" ||
        (view === "featured" && project.featured);

      // Filter by upload date.
      const uploadedAt =
        project.createdAt || project.uploadedAt;

      let matchDate = true;

      if (dateFilter !== "All") {
        const days = daysByFilter[dateFilter];

        if (!uploadedAt || !days) {
          matchDate = false;
        } else {
          const uploadedDate = new Date(uploadedAt);

          if (Number.isNaN(uploadedDate.getTime())) {
            matchDate = false;
          } else {
            const cutoff = new Date(now);
            cutoff.setDate(cutoff.getDate() - days);

            matchDate =
              uploadedDate >= cutoff &&
              uploadedDate <= now;
          }
        }
      }

      return (
        matchSearch &&
        matchSdg &&
        matchStatus &&
        matchView &&
        matchDate
      );
    });
  }, [
    projects,
    search,
    sdgFilter,
    statusFilter,
    dateFilter,
    view,
  ]);

  const featuredCount = useMemo(
    () => projects.filter((project) => project.featured).length,
    [projects]
  );

  return {
    loading,
    search,
    setSearch,
    sdgFilter,
    setSdgFilter,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    view,
    setView,
    filteredProjects,
    featuredCount,
    toggleFeatured,
    updateProject,
    reloadProjects: load,
  };
}