/**
 * Network request handler for UI thread
 * Handles fetch requests from plugin thread to bypass CORS restrictions
 */

import type {
  NetworkRequest,
  NetworkResponse,
} from "../../shared/network-types";

/**
 * Handle network request from plugin thread
 */
export async function handleNetworkRequest(
  request: NetworkRequest
): Promise<void> {
  try {
    console.log(`[NetworkProxy] Fetching ${request.url}`);

    const response = await fetch(request.url, request.options);

    console.log(`[NetworkProxy] Response status: ${response.status}`);

    let data: any;
    const contentType = response.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    const networkResponse: NetworkResponse = {
      id: request.id,
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      data,
    };

    parent.postMessage(
      {
        pluginMessage: networkResponse,
      },
      "*"
    );
  } catch (error: any) {
    console.error("[NetworkProxy] Fetch error:", error);

    const networkResponse: NetworkResponse = {
      id: request.id,
      ok: false,
      status: 0,
      statusText: "Error",
      data: null,
      error: error.message || "Network request failed",
    };

    parent.postMessage(
      {
        pluginMessage: networkResponse,
      },
      "*"
    );
  }
}
