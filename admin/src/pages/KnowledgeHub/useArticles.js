
import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";

import { api } from "../../services/api";

function matchesDateFilter(article, filter) {
  if (filter === "all") return true;

  const uploadedAt = article.createdAt || article.uploadedAt;
  if (!uploadedAt) return false;

  const date = new Date(uploadedAt);
  if (Number.isNaN(date.getTime())) return false;

  const now = new Date();
  const start = new Date(now);

  if (filter === "weekly") {
    start.setHours(0, 0, 0, 0);
    const day = start.getDay();
    start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
    return date >= start && date <= now;
  }

  if (filter === "monthly") {
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return date >= start && date <= now;
  }

  if (filter === "quarterly") {
    const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
    start.setMonth(quarterStartMonth, 1);
    start.setHours(0, 0, 0, 0);
    return date >= start && date <= now;
  }

  return true;
}

export function useArticles() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sdgFilter, setSdgFilter] = useState("All");
  const [catFilter, setCatFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("all");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/knowledge");
      const data = response.data ?? response;
      setArticles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load resources:", error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const appendArticleFields = (formData, form) => {
    formData.append("title", form.title || "");
    formData.append("summary", form.summary || "");
    formData.append("content", form.content || "");
    formData.append("sdgTag", form.sdgTag || "");
    formData.append("sdgTags", JSON.stringify(form.sdgTags || []));
    formData.append("category", form.category || "Guide");
    formData.append("readTime", form.readTime || "5 min read");
    formData.append("resourceType", form.resourceType || "uploaded");
    formData.append("sourceUrl", form.sourceUrl || "");
    formData.append("embedUrl", form.embedUrl || "");
    formData.append("thumbnailUrl", form.thumbnailUrl || "");
  };

  const createArticle = useCallback(async (form) => {
    const formData = new FormData();

    appendArticleFields(formData, form);

    (form.photos || [])
      .filter((photo) => photo instanceof File)
      .forEach((photo) => formData.append("photos", photo));

    if (form.document instanceof File) {
      formData.append("document", form.document);
    }

    await api.postForm("/knowledge", formData);
    await load();
  }, [load]);

  const updateArticle = useCallback(async (id, form) => {
    const formData = new FormData();

    appendArticleFields(formData, form);

    const photos = Array.isArray(form.photos) ? form.photos : [];

    formData.append(
      "existingPhotos",
      JSON.stringify(photos.filter((photo) => typeof photo === "string"))
    );

    photos
      .filter((photo) => photo instanceof File)
      .forEach((photo) => formData.append("photos", photo));

    if (form.document instanceof File) {
      formData.append("document", form.document);
    }

    formData.append(
      "keepExistingDocument",
      String(Boolean(form.existingDocument))
    );

    await api.putForm(`/knowledge/${id}`, formData);
    await load();
  }, [load]);

  const deleteArticle = useCallback(async (id) => {
    await api.delete(`/knowledge/${id}`);
    await load();
  }, [load]);

  const filteredArticles = useMemo(() => {
    const query = search.toLowerCase();

    return articles.filter((article) => {
      const matchSearch =
        article.title?.toLowerCase().includes(query) ||
        article.summary?.toLowerCase().includes(query) ||
        article.content?.toLowerCase().includes(query);

      const matchSdg =
        sdgFilter === "All" ||
        article.sdgTag === sdgFilter ||
        article.sdgTags?.includes(sdgFilter);

      const matchCategory =
        catFilter === "All" || article.category === catFilter;

      return (
        matchSearch &&
        matchSdg &&
        matchCategory &&
        matchesDateFilter(article, dateFilter)
      );
    });
  }, [articles, search, sdgFilter, catFilter, dateFilter]);

  return {
    loading,
    search,
    setSearch,
    sdgFilter,
    setSdgFilter,
    catFilter,
    setCatFilter,
    dateFilter,
    setDateFilter,
    filteredArticles,
    createArticle,
    updateArticle,
    deleteArticle,
    reloadArticles: load,
  };
}
