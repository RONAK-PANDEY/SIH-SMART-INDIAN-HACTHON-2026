// Shared API client.
// NOTE: If this file already exists in your project (e.g. src/api/client.ts),
// skip this one and just make sure `apiGet` has an equivalent signature.

const BASE_URL = "/api/v1";

function getAccessToken(): string | null {
  return localStorage.getItem("access_token");
}

export class ApiError extends Error {
  code: string;
  status: number;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function apiGet<T>(
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): Promise<T> {
  const query = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });
  }
  const qs = query.toString();
  const url = `${BASE_URL}${path}${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
    },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const err = body?.error ?? { code: "INTERNAL_ERROR", message: "Request failed" };
    throw new ApiError(res.status, err.code, err.message);
  }

  return body as T;
}
