
const API_BASE = "http://localhost:5000/api/ai";
const PROJECTS_API = "http://localhost:5000/api/projects";

const REQUEST_TIMEOUT = 60000;

async function fetchWithTimeout(
  url,
  options = {},
  timeoutMs = REQUEST_TIMEOUT
) {
  const controller = new AbortController();

  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "The request timed out after 60 seconds. Check the backend terminal and server connection."
      );
    }

    throw new Error(
      `Unable to connect to the server: ${error.message}`
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

function getToken() {
  return localStorage.getItem("adminToken");
}

function getAuthHeaders() {
  const token = getToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  return data.data;
}

export async function classifyText(title, description) {
  const response = await fetchWithTimeout(
    `${API_BASE}/classify-text`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ title, description }),
    }
  );

  return handleResponse(response);
}

export async function classifyFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithTimeout(
    `${API_BASE}/classify-file`,
    {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        `File classification failed (${response.status})`
    );
  }

  return {
    ...data.data,
    filename: data.filename || file.name,
  };
}

async function projectRequest(path, options = {}) {
  const response = await fetchWithTimeout(
    `${PROJECTS_API}${path}`,
    {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.body
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    }
  );

  return handleResponse(response);
}

export async function saveProjectDraft(project, projectId = null) {
  if (projectId) {
    return projectRequest(`/${projectId}`, {
      method: "PUT",
      body: JSON.stringify(project),
    });
  }

  return projectRequest("/", {
    method: "POST",
    body: JSON.stringify(project),
  });
}

export async function publishProject(projectId) {
  if (!projectId) {
    throw new Error(
      "Save the project as a draft before publishing it."
    );
  }

  return projectRequest(`/${projectId}/publish`, {
    method: "PATCH",
  });
}