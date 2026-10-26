
const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

const SERVER_URL = API_URL.replace(/\/api$/i, "");

export function getFileUrl(filePath) {
  if (!filePath || typeof filePath !== "string") {
    return "";
  }

  const path = filePath.trim();

  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      url.pathname = url.pathname.replace(
        /\/api\/uploads\//i,
        "/uploads/"
      );
      return url.toString();
    } catch {
      return path;
    }
  }

  const cleanPath = path
    .replace(/^\/+/, "")
    .replace(/^api\/uploads\//i, "")
    .replace(/^uploads\//i, "");

  return `${SERVER_URL}/uploads/${cleanPath}`;
}