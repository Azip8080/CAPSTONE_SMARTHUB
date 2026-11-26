
const BASE = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
).replace(/\/+$/, "");

function getHeaders(useJson = false) {
  const token = localStorage.getItem("token");

  const headers = {
    Accept: "application/json",
  };

  if (useJson) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

async function request(endpoint, options = {}) {
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      ...getHeaders(!isFormData && options.body !== undefined),
      ...options.headers,
    },
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new Error(json.message || "Something went wrong.");
  }

  return json.data ?? json;
}

export async function fetchEvents(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();

  return request(
    `/events${queryString ? `?${queryString}` : ""}`,
    { method: "GET" }
  );
}

export async function fetchMyEventSubmissions() {
  return request("/events/my-submissions", {
    method: "GET",
  });
}

export async function fetchAdminEvents() {
  return request("/events/admin/all", {
    method: "GET",
  });
}

export async function fetchPendingEvents() {
  return request("/events/admin/pending", {
    method: "GET",
  });
}

export async function createEvent(eventData) {
  const body =
    eventData instanceof FormData
      ? eventData
      : JSON.stringify(eventData);

  return request("/events", {
    method: "POST",
    body,
  });
}

export async function updateEvent(eventId, eventData) {
  const body =
    eventData instanceof FormData
      ? eventData
      : JSON.stringify(eventData);

  return request(`/events/${eventId}`, {
    method: "PUT",
    body,
  });
}

export async function approveEvent(eventId) {
  return request(`/events/${eventId}/approve`, {
    method: "PATCH",
  });
}

export async function rejectEvent(eventId, remarks) {
  return request(`/events/${eventId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ remarks }),
  });
}

export async function deleteEvent(eventId) {
  return request(`/events/${eventId}`, {
    method: "DELETE",
  });
}
