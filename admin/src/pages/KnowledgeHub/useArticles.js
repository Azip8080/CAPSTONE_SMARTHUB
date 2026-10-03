import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { api } from "../../services/api";

export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sdgFilter, setSdgFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");

  const load = useCallback(() => {
    setLoading(true);

    api
      .get("/knowledge")
      .then((d) =>
        setArticles(d.data ?? d)
      )
      .catch(() => setArticles([]))
      .finally(() =>
        setLoading(false)
      );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createArticle = useCallback(
    async (form) => {
      const formData = new FormData();

      formData.append(
        "title",
        form.title
      );

      formData.append(
        "summary",
        form.summary
      );

      formData.append(
        "content",
        form.content
      );

      formData.append(
        "sdgTag",
        form.sdgTag
      );

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "readTime",
        form.readTime
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

      await api.postForm(
        "/knowledge",
        formData
      );

      load();
    },
    [load]
  );

  const updateArticle = useCallback(
    async (id, form) => {
      const formData = new FormData();

      formData.append(
        "title",
        form.title
      );

      formData.append(
        "summary",
        form.summary
      );

      formData.append(
        "content",
        form.content
      );

      formData.append(
        "sdgTag",
        form.sdgTag
      );

      formData.append(
        "category",
        form.category
      );

      formData.append(
        "readTime",
        form.readTime
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
        `/knowledge/${id}`,
        formData
      );

      load();
    },
    [load]
  );

  const deleteArticle = useCallback(
    async (id) => {
      await api.delete(
        `/knowledge/${id}`
      );

      load();
    },
    [load]
  );

  const filteredArticles = useMemo(() => {
    const q =
      search.toLowerCase();

    return articles.filter((a) => {
      const matchSearch =
        a.title
          ?.toLowerCase()
          .includes(q);

      const matchSdg =
        sdgFilter === "All" ||
        a.sdgTag === sdgFilter;

      const matchCat =
        catFilter === "All" ||
        a.category === catFilter;

      return (
        matchSearch &&
        matchSdg &&
        matchCat
      );
    });
  }, [
    articles,
    search,
    sdgFilter,
    catFilter,
  ]);

  return {
    loading,
    search,
    setSearch,
    sdgFilter,
    setSdgFilter,
    catFilter,
    setCatFilter,
    filteredArticles,
    createArticle,
    updateArticle,
    deleteArticle,
  };
}