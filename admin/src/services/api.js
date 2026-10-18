const BASE = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
).replace(/\/+$/, "");

// Retrieve the saved authentication token
function getToken() {
  return (
    localStorage.getItem("adminToken") ||
    localStorage.getItem("token")
  );
}

// Add authorization headers when a token exists
function getHeaders() {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

// Send an API request
async function request(path, options = {}) {
  const normalizedPath = path.startsWith("/")
    ? path
    : `/${path}`;

  const url = `${BASE}${normalizedPath}`;

  const res = await fetch(url, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  // Handle unauthorized requests
  if (res.status === 401) {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");

    throw new Error("Unauthorized. Please log in again.");
  }

  // Safely parse the response
  const data = await res.json().catch(() => ({}));

  // Handle API errors
  if (!res.ok) {
    const error = new Error(
      data.message || `Request failed: ${res.status}`
    );

    error.status = res.status;
    error.data = data;

    throw error;
  }

  return data;
}

// Public API methods
export const api = {
  get: (path) => request(path),

  post: (path, body) =>
    request(path, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),

  put: (path, body) =>
    request(path, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),

  patch: (path, body) =>
    request(path, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }),

  postForm: (path, formData) =>
    request(path, {
      method: "POST",
      body: formData,
    }),

  putForm: (path, formData) =>
    request(path, {
      method: "PUT",
      body: formData,
    }),

  delete: (path) =>
    request(path, {
      method: "DELETE",
    }),
};