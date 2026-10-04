const BASE =
  "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem(
    "adminToken"
  );
}

function getHeaders() {
  const token = getToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}

async function request(
  path,
  options = {}
) {
  const res = await fetch(
    `${BASE}${path}`,
    {
      ...options,
      headers: {
        ...getHeaders(),
        ...options.headers,
      },
    }
  );

  if (res.status === 401) {
    localStorage.removeItem(
      "adminToken"
    );

    window.location.href = "/login";
  }

  if (!res.ok) {
    const data =
      await res.json().catch(
        () => ({})
      );

    throw new Error(
      data.message ||
        `Request failed: ${res.status}`
    );
  }

  return res.json();
}

export const api = {
  get: (path) =>
    request(path),

  post: (path, body) =>
    request(path, {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(body),
    }),

  put: (path, body) =>
    request(path, {
      method: "PUT",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify(body),
    }),

  patch: (path, body) =>
    request(path, {
      method: "PATCH",
      headers: {
        "Content-Type":
          "application/json",
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