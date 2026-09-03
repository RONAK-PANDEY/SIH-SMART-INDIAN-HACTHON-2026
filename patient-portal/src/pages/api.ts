// Minimal fetch wrapper matching docs/api-contracts.md conventions:
// - base path /api/v1/
// - bearer token auth
// - uniform error shape { error: { code, message, details } }

const API_BASE = "/api/v1";

export class ApiError extends Error {
  code: string;
  details: unknown;
  status: number;

  constructor(status: number, code: string, message: string, details: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export async function apiGet<T>(path: string): Promise<T> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const err = body?.error;
    throw new ApiError(
      res.status,
      err?.code ?? "INTERNAL_ERROR",
      err?.message ?? `Request to ${path} failed with status ${res.status}`,
      err?.details ?? null
    );
  }

  return body as T;
}
