const BASE = "http://localhost:5000/api";

function getHeaders() {
  const token = localStorage.getItem("adminToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: getHeaders(),
  });
  if (res.status === 401) {
    localStorage.removeItem("adminToken");
    window.location.href = "/login";
  }
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
}

export const api = {
  get:    (path)       => request(path),
  post:   (path, body) => request(path, { method: "POST",   body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: "PUT",    body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: "DELETE" }),
};