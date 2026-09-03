import axios from "axios";

// Placeholder — replace with the project's shared client if one already
// exists elsewhere (e.g. src/lib/api.ts). Kept separate here so
// Dashboard.tsx has a working import; swap the import path once merged.
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
