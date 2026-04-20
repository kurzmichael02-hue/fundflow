const API_BASE = "/api"

// Subclass so callers can do `instanceof ApiError` and check the HTTP status.
// The pages used to treat every fetch failure as "session expired, redirect
// to /login", which broke catastrophically when an unrelated backend error
// happened — users got bounced to login on a Supabase hiccup, logged in
// fine, hit the same page, and got bounced again.
export class ApiError extends Error {
  status: number
  body: unknown
  constructor(message: string, status: number, body: unknown) {
    super(message)
    this.name = "ApiError"
    this.status = status
    this.body = body
  }
}

// Generic so callers can keep their existing typed access patterns
// (`data.token`, `arr.map(...)`) without scattering `as any` everywhere.
// Defaults to `any` to match how the previous version of this module
// behaved — too many call-sites to retype right now.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  // Try to parse JSON; some routes return empty bodies on success.
  let data: unknown = null
  try { data = await res.json() } catch { /* ignore */ }

  if (!res.ok) {
    const message = (data && typeof data === "object" && "error" in data && typeof (data as { error: unknown }).error === "string")
      ? (data as { error: string }).error
      : `Request failed (${res.status})`
    throw new ApiError(message, res.status, data)
  }
  return data as T
}

/**
 * Centralised handler for catch blocks. Returns true if the caller should
 * stop and redirect to /login (401 only), false otherwise. The toast for
 * non-auth errors is the caller's responsibility — that way the message
 * stays in the page's own toast container.
 */
export function isUnauthorized(err: unknown): boolean {
  return err instanceof ApiError && err.status === 401
}

/**
 * Wipes the auth state and bounces the caller to the right login page.
 * Used as the response to a 401 from any authed call.
 */
export function clearSessionAndRedirect(redirect: (path: string) => void) {
  if (typeof window !== "undefined") {
    const userType = localStorage.getItem("user_type")
    localStorage.removeItem("token")
    localStorage.removeItem("user_type")
    redirect(userType === "investor" ? "/investor" : "/login")
  }
}

export const api = {
  login: (email: string, password: string, portal: "founder" | "investor" = "founder") =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password, portal }),
    }),

  register: (name: string, email: string, password: string) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  getInvestors: () => apiRequest("/investors"),

  addInvestor: (data: object) =>
    apiRequest("/investors", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateInvestor: (id: string, data: object) =>
    apiRequest(`/investors?id=${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  deleteInvestor: (id: string) =>
    apiRequest(`/investors?id=${id}`, { method: "DELETE" }),
}
