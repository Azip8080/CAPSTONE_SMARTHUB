const API_ORIGIN = (
  import.meta.env.VITE_API_URL ||
  "https://sdg-smarthub-api.onrender.com"
)
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const API_BASE = `${API_ORIGIN}/api`;
const AI_API = `${API_BASE}/ai`;
const PROJECTS_API = `${API_BASE}/projects`;
const EVENTS_API = `${API_BASE}/events`;
const KNOWLEDGE_API = `${API_BASE}/knowledge`;

const REQUEST_TIMEOUT = 30000;

function getToken() {
  return localStorage.getItem("adminToken");
}

function getAuthHeaders() {
  const token = getToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();

  const timeoutId = setTimeout(
    () => controller.abort(),
    REQUEST_TIMEOUT
  );

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("The request timed out. Please try again.");
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message ||
        data.error ||
        `Request failed (${response.status})`
    );
  }

  return data.data ?? data;
}

async function destinationRequest(url, options = {}) {
  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  const headers = {
    ...getAuthHeaders(),
    ...(options.body && !isFormData
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
  };

  const response = await fetchWithTimeout(url, {
    ...options,
    headers,
  });

  return handleResponse(response);
}

export async function classifyText(title, description = "") {
  const cleanTitle = String(title ?? "").trim();
  const cleanDescription = String(description ?? "").trim();

  const text = [cleanTitle, cleanDescription]
    .filter(Boolean)
    .join("\n\n");

  console.log("[AI Service] Title:", cleanTitle);
  console.log("[AI Service] Description:", cleanDescription);
  console.log("[AI Service] Sending text:", text);

  if (!text) {
    throw new Error(
      "Enter a project title or description before classifying."
    );
  }

  const response = await fetchWithTimeout(
    `${AI_API}/classify-text`,
    {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: cleanTitle,
        description: cleanDescription,
        text,
      }),
    }
  );

  return handleResponse(response);
}

export async function classifyFile(file) {
  if (!file) {
    throw new Error("Please select a PDF or TXT file.");
  }

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetchWithTimeout(
    `${AI_API}/classify-file`,
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
        data.error ||
        `File classification failed (${response.status})`
    );
  }

  return {
    ...(data.data || {}),
    filename: data.filename || file.name,
    document: data.document || null,
  };
}

export async function saveProjectDraft(project, projectId = null) {
  const url = projectId
    ? `${PROJECTS_API}/${projectId}`
    : PROJECTS_API;

  const formData = new FormData();

  formData.append("title", project.title || "");
  formData.append("description", project.description || "");
  formData.append("sdgTag", project.sdgTag || "");
  formData.append("sdgTags", JSON.stringify(project.sdgTags || []));
  formData.append("tags", JSON.stringify(project.tags || []));
  formData.append("barangay", project.barangay || "");
  formData.append("status", project.status || "Planned");

  if (project.featured !== undefined) {
    formData.append("featured", String(project.featured));
  }

  if (
    typeof File !== "undefined" &&
    project.document instanceof File
  ) {
    formData.append("document", project.document);
  }

  (project.photos || []).forEach((photo) => {
    if (typeof File !== "undefined" && photo instanceof File) {
      formData.append("photos", photo);
    }
  });

  return destinationRequest(url, {
    method: projectId ? "PUT" : "POST",
    body: formData,
  });
}

export async function publishProject(projectId) {
  if (!projectId) {
    throw new Error("A project ID is required to publish.");
  }

  return destinationRequest(
    `${PROJECTS_API}/${projectId}/publish`,
    { method: "PATCH" }
  );
}

export async function saveEvent(event, eventId = null) {
  const url = eventId
    ? `${EVENTS_API}/${eventId}`
    : EVENTS_API;

  const formData = new FormData();

  formData.append("title", event.title || "");
  formData.append("description", event.description || "");
  formData.append("sdgTag", event.sdgTag || "");
  formData.append("date", event.date || "");
  formData.append("location", event.location || "");

  if (
    typeof File !== "undefined" &&
    event.document instanceof File
  ) {
    formData.append("document", event.document);
  }

  return destinationRequest(url, {
    method: eventId ? "PUT" : "POST",
    body: formData,
  });
}

export async function saveKnowledgeResource(
  resource,
  resourceId = null
) {
  const url = resourceId
    ? `${KNOWLEDGE_API}/${resourceId}`
    : KNOWLEDGE_API;

  const formData = new FormData();

  formData.append("title", resource.title || "");
  formData.append("summary", resource.summary || "");
  formData.append("sdgTag", resource.sdgTag || "");
  formData.append("category", resource.category || "Guide");
  formData.append("readTime", String(resource.readTime || "5"));
  formData.append("content", resource.content || "");

  if (resourceId) {
    formData.append(
      "existingPhotos",
      JSON.stringify(resource.existingPhotos || [])
    );
  }

  (resource.photos || []).forEach((photo) => {
    if (typeof File !== "undefined" && photo instanceof File) {
      formData.append("photos", photo);
    }
  });

  if (
    typeof File !== "undefined" &&
    resource.document instanceof File
  ) {
    formData.append("document", resource.document);
  }

  return destinationRequest(url, {
    method: resourceId ? "PUT" : "POST",
    body: formData,
  });
}

export function getDocumentUrl(document) {
  if (!document) return "";

  if (document.id) {
    return `${AI_API}/documents/${document.id}/download`;
  }

  if (document.path) {
    if (/^https?:\/\//i.test(document.path)) {
      return document.path;
    }

    return `${API_ORIGIN}${
      document.path.startsWith("/") ? "" : "/"
    }${document.path}`;
  }

  return "";
}

export async function downloadDocument(document) {
  const url = getDocumentUrl(document);

  if (!url) {
    throw new Error("No uploaded document is available.");
  }

  const response = await fetchWithTimeout(url, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));

    throw new Error(
      data.message || "Unable to download the document."
    );
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = window.document.createElement("a");

  link.href = objectUrl;
  link.download = document.originalName || "document";

  window.document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}