
const BASE = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
).replace(/\/+$/, "");

export async function fetchEvents(params = {}) {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Please log in to view events.");
  }

  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  const url = `${BASE}/events${queryString ? `?${queryString}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new Error(json.message || "Failed to fetch events.");
  }

  return json.data ?? json;
}
