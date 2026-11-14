const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000").replace(/\/$/, "");
let csrfToken: string | null = null;

type ApiError = Error & { status?: number };

async function csrf(): Promise<string> {
  const response = await fetch(`${API_BASE}/api/v1/auth/csrf/`, { credentials: "include" });
  if (!response.ok) throw new Error("Could not start a secure session. Please try again.");
  const data = (await response.json()) as { csrfToken: string };
  csrfToken = data.csrfToken;
  return csrfToken;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");
  if (!["GET", "HEAD", "OPTIONS", "TRACE"].includes(method)) {
    headers.set("X-CSRFToken", csrfToken || await csrf());
  }
  const response = await fetch(`${API_BASE}/api/v1/${path.replace(/^\//, "")}`, {
    ...init,
    method,
    headers,
    credentials: "include",
  });
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => ({}));
  if (typeof payload.csrfToken === "string") csrfToken = payload.csrfToken;
  if (!response.ok) {
    const detail = payload.detail || Object.values(payload).flat().join(" ") || "Request failed.";
    const error = new Error(String(detail)) as ApiError;
    error.status = response.status;
    throw error;
  }
  return payload as T;
}

export type ChildProfile = {
  id: number;
  nickname: string;
  avatar_id: string;
  age_band: string;
  timezone: string;
  is_active: boolean;
};

export type Account = { id: number; email: string; first_name: string; email_verified: boolean };
export type CurrentAccount = { user: Account; children: ChildProfile[] };
