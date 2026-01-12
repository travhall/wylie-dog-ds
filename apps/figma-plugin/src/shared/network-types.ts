/**
 * Network proxy types for UI <-> Plugin communication
 * Used to proxy fetch requests from plugin thread through UI thread to avoid CORS
 */

export interface NetworkRequest {
  id: string;
  url: string;
  options: RequestInit;
}

export interface NetworkResponse {
  id: string;
  ok: boolean;
  status: number;
  statusText: string;
  data: any;
  error?: string;
}
