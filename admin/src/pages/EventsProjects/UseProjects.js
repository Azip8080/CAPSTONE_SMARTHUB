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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const load = useCallback(() => {
    setLoading(true);

    api
      .get("/projects/admin/all")
      .then((d) =>
        setProjects(d.data ?? d)
      )
      .finally(() =>
        setLoading(false)
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createProject = useCallback(
  async (form) => {
    console.log(
      "EVENTS CREATE PROJECT REACHED"
    );

    console.log(
      "FORM PHOTOS:",
      form.photos
    );

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

      const matchFilter =
        filter === "All" ||
        p.status === filter;

      return (
        matchSearch &&
        matchFilter
      );
    });
  }, [
    projects,
    search,
    filter,
  ]);

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