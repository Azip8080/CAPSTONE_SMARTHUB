import { useState, useEffect, useMemo, useCallback } from "react";
import { api } from "../../services/api";

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    api
      .get("/users")
      .then((d) => setUsers(d.data ?? d))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const updateUser = useCallback(
    async (id, form) => {
      await api.put(`/users/${id}`, form);
      load();
    },
    [load]
  );

  const deleteUser = useCallback(
    async (id) => {
      await api.delete(`/users/${id}`);
      load();
    },
    [load]
  );

  const filteredUsers = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      const matchSearch =
        u.fullName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.barangay?.toLowerCase().includes(q);
      const matchRole = roleFilter === "All" || u.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [users, search, roleFilter]);

  const counts = useMemo(
    () => ({
      all: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      barangay_personnel: users.filter((u) => u.role === "barangay_personnel").length,
      community_member: users.filter((u) => u.role === "community_member").length,
    }),
    [users]
  );

  return {
    loading,
    error,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    filteredUsers,
    counts,
    updateUser,
    deleteUser,
  };
}