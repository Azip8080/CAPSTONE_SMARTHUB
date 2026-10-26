
const BASE = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "token";

async function projectRequest(endpoint = "", params = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  if (!token) {
    throw new Error("Please log in to view projects.");
  }

  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.set(key, String(value));
    }
  });

  const query = queryParams.toString();

  const url = `${BASE}/projects${endpoint}${
    query ? `?${query}` : ""
  }`;

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
      json.message ||
        `Failed to fetch projects (HTTP ${res.status}).`
    );
  }

  return json.data ?? json;
}

export async function fetchProjects(params = {}) {
  return projectRequest("", params);
}

export async function fetchProjectsByBarangay(barangay) {
  if (!barangay) {
    throw new Error("Barangay name is required.");
  }

  return projectRequest(
    `/barangay/${encodeURIComponent(barangay)}/published`
  );
}

export async function fetchBarangayRanking() {
  const url = `${BASE}/projects/barangay-ranking`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/json",
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new Error(
      json.message || "Failed to fetch barangay ranking."
    );
  }

  return json.data ?? json;
}
