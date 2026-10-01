
const API_BASE = "http://localhost:5000/api/ai";

function getToken() {
  return localStorage.getItem("adminToken");
}

async function handleResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || `Request failed (${response.status})`
    );
  }

  if (data.success === false) {
    throw new Error(data.message || "Classification failed.");
  }

  return data.data;
}

export async function classifyText(title, description) {
  const response = await fetch(`${API_BASE}/classify-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ title, description }),
  });

  return handleResponse(response);
}

export async function classifyFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE}/classify-file`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
    body: formData,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.success === false) {
    throw new Error(
      data.message || `File classification failed (${response.status})`
    );
  }

  return {
    ...data.data,
    filename: data.filename || file.name,
  };
}