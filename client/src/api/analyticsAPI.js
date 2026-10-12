const BASE = "https://sdg-smarthub-api.onrender.com/api/analytics";


export async function fetchDashboardSummary() {
  const res = await fetch(
    `${BASE}/dashboard-summary`
  );

  if (!res.ok) {
    throw new Error(
      "Failed to fetch dashboard summary"
    );
  }

  const json = await res.json();

  return json.data;
}