const BASE = "http://localhost:5000/api/projects";

export async function fetchProjects(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}?${query}`);
  if (!res.ok) throw new Error("Failed to fetch projects");
  const json = await res.json();
  return json.data ?? json;
}