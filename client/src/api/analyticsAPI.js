const BASE = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "token";

async function analyticsRequest(endpoint, params = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error("Please log in to view analytics.");
  }

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.set(key, String(value));
    }
  });

  const query = queryParams.toString();
  const url = `${BASE}/analytics/${endpoint}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new Error(
      json.message || `Failed to fetch ${endpoint} (HTTP ${res.status}).`
    );
  }

  return json.data;
}

export async function fetchDistribution(params = {}) {
  return analyticsRequest("distribution", params);
}

export async function fetchParticipation(params = {}) {
  return analyticsRequest("participation", params);
}

export async function fetchTrend(params = {}) {
  return analyticsRequest("trend", params);
}

export async function fetchDashboardSummary(params = {}) {
  return analyticsRequest("dashboard-summary", params);
}