import { useState, useEffect, useMemo, useCallback } from "react";
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
      .then((d) => setArticles(d.data ?? d))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const createArticle = useCallback(
    async (form) => {
      await api.post("/knowledge", form);
      load();
    },
    [load]
  );

  const updateArticle = useCallback(
    async (id, form) => {
      await api.put(`/knowledge/${id}`, form);
      load();
    },
    [load]
  );

  const deleteArticle = useCallback(
    async (id) => {
      await api.delete(`/knowledge/${id}`);
      load();
    },
    [load]
  );

  const filteredArticles = useMemo(() => {
    const q = search.toLowerCase();
    return articles.filter((a) => {
      const matchSearch = a.title?.toLowerCase().includes(q);
      const matchSdg = sdgFilter === "All" || a.sdgTag === sdgFilter;
      const matchCat = catFilter === "All" || a.category === catFilter;
      return matchSearch && matchSdg && matchCat;
    });
  }, [articles, search, sdgFilter, catFilter]);

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