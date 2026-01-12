/**
 * Network proxy utilities
 * Uses XMLHttpRequest in plugin sandbox which respects networkAccess permissions
 */

/**
 * Make a network request using XMLHttpRequest (respects manifest networkAccess)
 */
export async function proxyFetch(
  url: string,
  options: RequestInit
): Promise<Response> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(options.method || "GET", url, true);

    // Set headers
    if (options.headers) {
      const headers = options.headers as Record<string, string>;
      for (const [key, value] of Object.entries(headers)) {
        xhr.setRequestHeader(key, value);
      }
    }

    xhr.onload = () => {
      let data: any;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        data = xhr.responseText;
      }

      // Create a Response-like object
      const mockResponse = {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        json: async () => data,
        text: async () => xhr.responseText,
      } as Response;

      resolve(mockResponse);
    };

    xhr.onerror = () => {
      reject(
        new Error(
          `Network request failed: ${xhr.statusText || "Unknown error"}`
        )
      );
    };

    xhr.ontimeout = () => {
      reject(new Error("Network request timeout"));
    };

    xhr.timeout = 30000;

    // Send body if present
    if (options.body) {
      xhr.send(options.body as string);
    } else {
      xhr.send();
    }
  });
}
