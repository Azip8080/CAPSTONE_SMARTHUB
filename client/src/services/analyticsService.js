const BASE = "https://sdg-smarthub-api.onrender.com/api/analytics";


export async function fetchDistribution(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/distribution?${query}`);
  if (!res.ok) throw new Error("Failed to fetch distribution");
  const json = await res.json();
  return json.data;
}

export async function fetchParticipation(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/participation?${query}`);
  if (!res.ok) throw new Error("Failed to fetch participation");
  const json = await res.json();
  return json.data;
}

export async function fetchTrend(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/trend?${query}`);
  if (!res.ok) throw new Error("Failed to fetch trend");
  const json = await res.json();
  return json.data;
}