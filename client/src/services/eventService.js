const BASE = "http://localhost:5000/api/events";

export async function fetchEvents(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}?${query}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  const json = await res.json();
  return json.data ?? json;
}