import type {
  HospitalDetail,
  HospitalListFilters,
  HospitalListResponse,
} from "../types/hospital";

const BASE_URL = "/api/v1/hospitals";

function buildQuery(filters: HospitalListFilters): string {
  const params = new URLSearchParams();
  if (filters.state) params.set("state", filters.state);
  if (filters.district) params.set("district", filters.district);
  if (filters.status) params.set("status", filters.status);
  if (filters.search) params.set("search", filters.search);
  if (filters.page) params.set("page", String(filters.page));
  if (filters.page_size) params.set("page_size", String(filters.page_size));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export async function fetchHospitals(
  filters: HospitalListFilters,
  signal?: AbortSignal
): Promise<HospitalListResponse> {
  const res = await fetch(`${BASE_URL}${buildQuery(filters)}`, { signal });
  if (!res.ok) {
    throw new Error(`Failed to load hospitals (${res.status})`);
  }
  return res.json();
}

export async function fetchHospitalDetail(
  id: string,
  signal?: AbortSignal
): Promise<HospitalDetail> {
  const res = await fetch(`${BASE_URL}/${encodeURIComponent(id)}`, { signal });
  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Hospital not found");
    }
    throw new Error(`Failed to load hospital (${res.status})`);
  }
  return res.json();
}

// Distinct states / districts are derived from the same list endpoint so the
// drill-down doesn't need separate geography endpoints. If your backend
// exposes /api/v1/hospitals/states and /districts, swap these out.
export async function fetchStatesAndDistricts(
  signal?: AbortSignal
): Promise<{ state: string; district: string }[]> {
  const res = await fetch(`${BASE_URL}?page_size=1000`, { signal });
  if (!res.ok) {
    throw new Error(`Failed to load geography (${res.status})`);
  }
  const data: HospitalListResponse = await res.json();
  const seen = new Set<string>();
  const pairs: { state: string; district: string }[] = [];
  for (const h of data.results) {
    const key = `${h.state}::${h.district}`;
    if (!seen.has(key)) {
      seen.add(key);
      pairs.push({ state: h.state, district: h.district });
    }
  }
  return pairs;
}
