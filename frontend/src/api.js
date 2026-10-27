const TOKEN_KEY = "ai-aura-admin-token";

/**
 * Returns the sanitized base URL for the backend API.
 * Priority:
 * 1. Explicitly configured REACT_APP_API_URL environment variable (from Vercel or .env)
 * 2. If running on Vercel (or any external production host), default to Render backend:
 *    https://kle-aura.onrender.com
 * 3. Relative "" for local development & full-stack container environments.
 */
export function getApiBaseUrl() {
  const envUrl = (process.env.REACT_APP_API_URL || "").trim();
  if (envUrl) {
    // Strip trailing /api and trailing slashes to prevent /api/api/... duplication
    return envUrl.replace(/\/api\/?$/i, "").replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.includes("ais-") ||
      host.includes("run.app");
    if (!isLocal || host.endsWith("vercel.app")) {
      return "https://kle-aura.onrender.com";
    }
  }

  return "";
}

export function getEndpointUrl(path = "") {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token
    ? sessionStorage.setItem(TOKEN_KEY, token)
    : sessionStorage.removeItem(TOKEN_KEY);

/**
 * Small, robust fetch wrapper.
 * Safely parses responses, prevents "Unexpected end of JSON input",
 * checks HTTP status codes, and provides descriptive error messages.
 */
export async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

  const url = getEndpointUrl(path);

  let res;
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    const err = new Error(
      "Unable to connect to the backend server. Please check your network connection or verify the Render service is running."
    );
    err.isNetworkError = true;
    err.original = networkError;
    throw err;
  }

  // Safely extract response text first to handle empty, HTML, or malformed bodies
  const rawText = await res.text().catch(() => "");
  let data = null;
  if (rawText && rawText.trim()) {
    try {
      data = JSON.parse(rawText);
    } catch (_) {
      // Non-JSON response (e.g. HTML error page or empty proxy response)
    }
  }

  if (!res.ok) {
    const errorMsg =
      (data && (data.message || data.error)) ||
      (res.status === 405
        ? "Method not allowed (405). The request reached an invalid endpoint."
        : res.status === 404
        ? "API endpoint not found (404). Please verify backend availability."
        : res.status === 429
        ? "Too many requests. Please wait a few moments before trying again."
        : res.status >= 500
        ? "Server error. The backend service may be starting up or temporarily unavailable."
        : `Request failed with status ${res.status}.`);

    const err = new Error(errorMsg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
