const configuredApiUrl = (import.meta as ImportMeta & { env?: Record<string, string> }).env?.VITE_API_URL?.trim();

export const API_URL = configuredApiUrl || `${window.location.protocol}//${window.location.hostname}:8000`;
export const API_V1_URL = `${API_URL}/api/v1`;

export function websocketUrl(path: string): string {
  const url = new URL(API_URL);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = path;
  return url.toString();
}
