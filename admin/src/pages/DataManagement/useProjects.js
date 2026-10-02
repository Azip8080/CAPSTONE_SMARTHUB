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
  const [filterStatus, setFilterStatus] =
    useState("All");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    api
      .get("/projects/admin/all")
      .then((data) =>
        setProjects(data.data ?? data)
      )
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createProject = useCallback(
    async (form) => {
      const formData = new FormData();

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

      if (form.sdgTags) {
        formData.append(
          "sdgTags",
          JSON.stringify(form.sdgTags)
        );
      }

      if (form.tags) {
        formData.append(
          "tags",
          JSON.stringify(form.tags)
        );
      }

      const photos = Array.isArray(
        form.photos
      )
        ? form.photos
        : [];

      photos
        .filter(
          (photo) =>
            photo instanceof File
        )
        .forEach((photo) => {
          formData.append(
            "photos",
            photo
          );
        });

      console.log(
        "PHOTOS:",
        photos
      );

      console.log(
        "FILES:",
        photos.filter(
          (photo) =>
            photo instanceof File
        )
      );

      console.log(
        "FORM DATA PHOTOS:",
        formData.getAll("photos")
      );

      await api.postForm(
        "/projects",
        formData
      );

      load();
    },
    [load]
  );

  const updateProject = useCallback(
    async (id, form) => {
      const formData = new FormData();

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

      if (form.sdgTags) {
        formData.append(
          "sdgTags",
          JSON.stringify(form.sdgTags)
        );
      }

      if (form.tags) {
        formData.append(
          "tags",
          JSON.stringify(form.tags)
        );
      }

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

  const deleteProject = useCallback(
    async (id) => {
      await api.delete(
        `/projects/${id}`
      );

      load();
    },
    [load]
  );

  const filteredProjects = useMemo(() => {
    const q = search.toLowerCase();

    return projects.filter((p) => {
      const matchSearch =
        p.title
          ?.toLowerCase()
          .includes(q) ||
        p.barangay
          ?.toLowerCase()
          .includes(q);

      const matchSDG =
        filterSDG === "All" ||
        p.sdgTag === filterSDG;

      const matchStatus =
        filterStatus === "All" ||
        p.status === filterStatus;

      return (
        matchSearch &&
        matchSDG &&
        matchStatus
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
  };
}