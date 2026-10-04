const BASE =
  "http://localhost:5000/api/events";

export async function fetchEvents(
  params = {}
) {
  const query =
    new URLSearchParams(
      params
    ).toString();

  const url = query
    ? `${BASE}?${query}`
    : BASE;

  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      "Failed to fetch events"
    );
  }

  const json = await res.json();

  return json.data ?? json;
}