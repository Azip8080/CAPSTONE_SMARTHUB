const BASE = "https://sdg-smarthub-api.onrender.com/api/knowledge";


export async function fetchGuides() {
  const res = await fetch(BASE);
  if (!res.ok) throw new Error("Failed to fetch guides");
  const json = await res.json();
  return json.data ?? json;
}