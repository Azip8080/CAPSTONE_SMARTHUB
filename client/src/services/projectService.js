
const BASE = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com/api"
).replace(/\/+$/, "");

const TOKEN_KEY = "token";

async function projectRequest(endpoint = "", options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);

  const headers = {
    Accept: "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${BASE}/projects${endpoint}`, {
    ...options,
    headers,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok || json.success === false) {
    throw new Error(
      json.message || `Project request failed (HTTP ${res.status}).`
    );
  }

  return json.data ?? json;
}

export async function fetchProjects(params = {}) {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.set(key, String(value));
    }
  });

  const query = queryParams.toString();

  const data = await projectRequest(
    query ? `?${query}` : ""
  );

  if (!Array.isArray(data)) {
    throw new Error("The projects API did not return a project list.");
  }

  return data;
}

export async function fetchProjectsByBarangay(barangay) {
  if (!barangay) {
    throw new Error("Barangay name is required.");
  }

  const data = await projectRequest(
    `/barangay/${encodeURIComponent(barangay)}/published`
  );

  if (!Array.isArray(data)) {
    throw new Error("The projects API did not return a project list.");
  }

  return data;
}


export async function fetchBarangayRanking() {
  const data = await projectRequest("/barangay-ranking");

  if (!Array.isArray(data)) {
    throw new Error("The barangay ranking API did not return a list.");
  }

  return data;
}


export async function fetchAllProjectsAdmin() {
  const data = await projectRequest("/admin/all");

  if (!Array.isArray(data)) {
    throw new Error("The admin projects API did not return a project list.");
  }

  return data;
}


export async function fetchPendingProjects() {
  const data = await projectRequest("/admin/pending");

  if (!Array.isArray(data)) {
    throw new Error("The pending projects API did not return a project list.");
  }

  return data;
}


export async function createProject(projectData) {
  return projectRequest("", {
    method: "POST",
    body: projectData,
  });
}


export async function fetchMyProjects() {
  const data = await projectRequest("/my-submissions");

  if (!Array.isArray(data)) {
    throw new Error("The submissions API did not return a project list.");
  }

  return data;
}

export async function fetchProjectById(projectId) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  return projectRequest(`/${projectId}`);
}

export async function updateProject(projectId, projectData) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  return projectRequest(`/${projectId}`, {
    method: "PUT",
    body: projectData,
  });
}

export async function approveProject(projectId) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  return projectRequest(`/${projectId}/approve`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function rejectProject(projectId, remarks) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  if (!remarks?.trim()) {
    throw new Error("Rejection remarks are required.");
  }

  return projectRequest(`/${projectId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({
      remarks: remarks.trim(),
    }),
  });
}

export async function publishProject(projectId) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  return projectRequest(`/${projectId}/publish`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function unpublishProject(projectId) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  return projectRequest(`/${projectId}/unpublish`, {
    method: "PATCH",
    body: JSON.stringify({}),
  });
}

export async function updateProjectFeatured(projectId, featured) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  return projectRequest(`/${projectId}/featured`, {
    method: "PATCH",
    body: JSON.stringify({ featured }),
  });
}

// ADMIN / authorized owner: Delete a project.
export async function deleteProject(projectId) {
  if (!projectId) {
    throw new Error("Project ID is required.");
  }

  return projectRequest(`/${projectId}`, {
    method: "DELETE",
  });
}
