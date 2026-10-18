const TOKEN_KEY = "ai-aura-admin-token";

export const getToken = () => sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token) =>
  token
    ? sessionStorage.setItem(TOKEN_KEY, token)
    : sessionStorage.removeItem(TOKEN_KEY);

// Small fetch wrapper. Pass { auth: true } for admin-only endpoints.
export async function api(path, { method = "GET", body, auth = false } = {}) {
  const headers = {};
  if (body) headers["Content-Type"] = "application/json";
  if (auth && getToken()) headers.Authorization = `Bearer ${getToken()}`;

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    /* empty body */
  }

  if (!res.ok) {
    const err = new Error((data && data.message) || "Request failed.");
    err.status = res.status;
    throw err;
  }
  return data;
}
