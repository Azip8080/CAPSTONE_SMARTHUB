const BASE = "http://localhost:5000/api/analytics";

export async function fetchDashboardSummary() {
  const res = await fetch(`${BASE}/summary`);

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }

  const json = await res.json();
  return json.data;
}