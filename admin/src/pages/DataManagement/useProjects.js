
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { api } from "../../services/api";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [filterSDG, setFilterSDG] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.get("/projects/admin/all");
      const projectsData = data.data ?? data;

      setProjects(
        Array.isArray(projectsData) ? projectsData : []
      );
    } catch (err) {
      setError(err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Build the form data shared by project creation and editing.
  const buildProjectFormData = (form, isEdit = false) => {
    const formData = new FormData();

    formData.append("title", form.title || "");
    formData.append("description", form.description || "");
    formData.append("sdgTag", form.sdgTag || "");
    formData.append(
      "sdgTags",
      JSON.stringify(form.sdgTags || [])
    );
    formData.append(
      "tags",
      JSON.stringify(form.tags || [])
    );
    formData.append("barangay", form.barangay || "");
    formData.append("status", form.status || "Planned");

    if (form.featured !== undefined) {
      formData.append("featured", String(form.featured));
    }

    // Upload the project document when a new file is selected.
    if (
      typeof File !== "undefined" &&
      form.document instanceof File
    ) {
      formData.append("document", form.document);
    }

    const photos = Array.isArray(form.photos)
      ? form.photos
      : [];

    if (isEdit) {
      // Preserve existing photo paths when editing.
      const existingPhotos = photos.filter(
        (photo) => typeof photo === "string"
      );

      formData.append(
        "existingPhotos",
        JSON.stringify(existingPhotos)
      );
    }

    // Upload newly selected photos.
    photos
      .filter(
        (photo) =>
          typeof File !== "undefined" &&
          photo instanceof File
      )
      .forEach((photo) => {
        formData.append("photos", photo);
      });

    return formData;
  };

  const createProject = useCallback(
    async (form) => {
      await api.postForm(
        "/projects",
        buildProjectFormData(form)
      );

      await load();
    },
    [load]
  );

  const updateProject = useCallback(
    async (id, form) => {
      await api.putForm(
        `/projects/${id}`,
        buildProjectFormData(form, true)
      );

      await load();
    },
    [load]
  );

  const deleteProject = useCallback(
    async (id) => {
      await api.delete(`/projects/${id}`);
      await load();
    },
    [load]
  );

  const publishProject = useCallback(
    async (id) => {
      await api.patch(`/projects/${id}/publish`);
      await load();
    },
    [load]
  );

  const unpublishProject = useCallback(
    async (id) => {
      await api.patch(`/projects/${id}/unpublish`);
      await load();
    },
    [load]
  );

  const filteredProjects = useMemo(() => {
    const query = search.toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        project.title?.toLowerCase().includes(query) ||
        project.barangay?.toLowerCase().includes(query);

      const projectSDGs = [
        project.sdgTag,
        ...(Array.isArray(project.sdgTags)
          ? project.sdgTags
          : []),
      ].filter(Boolean);

      const matchesSDG =
        filterSDG === "All" ||
        projectSDGs.includes(filterSDG);

      const matchesStatus =
        filterStatus === "All" ||
        project.status === filterStatus;

      return (
        matchesSearch &&
        matchesSDG &&
        matchesStatus
      );
    });
  }, [
    projects,
    search,
    filterSDG,
    filterStatus,
  ]);

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
    publishProject,
    unpublishProject,

    reloadProjects: load,
  };
}
