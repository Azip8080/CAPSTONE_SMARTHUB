import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { api } from "../../services/api";

export function useShowcaseProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] =
    useState(true);
  const [search, setSearch] =
    useState("");
  const [sdgFilter, setSdgFilter] =
    useState("All");
  const [statusFilter, setStatusFilter] =
    useState("All");
  const [view, setView] =
    useState("all");

  const load = useCallback(() => {
    setLoading(true);

    api
      .get("/projects/admin/all")
      .then((data) =>
        setProjects(
          data.data ?? data
        )
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateProject = useCallback(
    async (id, form) => {
      const formData =
        new FormData();

      formData.append(
        "title",
        form.title
      );

      formData.append(
        "description",
        form.description
      );

      formData.append(
        "sdgTag",
        form.sdgTag
      );

      formData.append(
        "barangay",
        form.barangay
      );

      formData.append(
        "status",
        form.status
      );

      formData.append(
        "sdgTags",
        JSON.stringify(
          form.sdgTags || []
        )
      );

      formData.append(
        "tags",
        JSON.stringify(
          form.tags || []
        )
      );

      formData.append(
        "featured",
        String(
          form.featured || false
        )
      );

      const existingPhotos =
        Array.isArray(form.photos)
          ? form.photos.filter(
              (photo) =>
                typeof photo ===
                "string"
            )
          : [];

      formData.append(
        "existingPhotos",
        JSON.stringify(
          existingPhotos
        )
      );

      const newPhotos =
        Array.isArray(form.photos)
          ? form.photos.filter(
              (photo) =>
                photo instanceof File
            )
          : [];

      newPhotos.forEach((photo) => {
        formData.append(
          "photos",
          photo
        );
      });

      await api.putForm(
        `/projects/${id}`,
        formData
      );

      load();
    },
    [load]
  );

  const toggleFeatured =
    useCallback(
      async (project) => {
        await api.put(
          `/projects/${project._id}`,
          {
            featured:
              !project.featured,
          }
        );

        load();
      },
      [load]
    );

  const filteredProjects =
    useMemo(() => {
      const q =
        search.toLowerCase();

      return projects.filter((p) => {
        const sdgs =
          Array.isArray(p.sdgTags) &&
          p.sdgTags.length > 0
            ? p.sdgTags
            : [p.sdgTag];

        const matchSearch =
          p.title
            ?.toLowerCase()
            .includes(q) ||
          p.barangay
            ?.toLowerCase()
            .includes(q);

        const matchSdg =
          sdgFilter === "All" ||
          sdgs.includes(sdgFilter);

        const matchStatus =
          statusFilter === "All" ||
          p.status === statusFilter;

        const matchView =
          view === "all" ||
          (view === "featured" &&
            p.featured);

        return (
          matchSearch &&
          matchSdg &&
          matchStatus &&
          matchView
        );
      });
    }, [
      projects,
      search,
      sdgFilter,
      statusFilter,
      view,
    ]);

  const featuredCount =
    useMemo(
      () =>
        projects.filter(
          (p) => p.featured
        ).length,
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
    view,
    setView,
    filteredProjects,
    featuredCount,
    toggleFeatured,
    updateProject,
  };
}