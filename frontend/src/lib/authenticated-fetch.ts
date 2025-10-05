/**
 * Utility functions for making authenticated API requests
 * This helps frontend components easily add authentication headers
 */

/**
 * Get authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Create authenticated fetch headers
 * Adds Authorization header with Bearer token
 */
export function createAuthHeaders(
  additionalHeaders: Record<string, string> = {}
): HeadersInit {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...additionalHeaders,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Wrapper around fetch that automatically adds authentication headers
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = createAuthHeaders(
    (options.headers as Record<string, string>) || {}
  );

  return fetch(url, {
    ...options,
    headers,
  });
}

/**
 * Wrapper for authenticated fetch that handles JSON responses
 */
export async function authenticatedFetchJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await authenticatedFetch(url, options);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: "Request failed" }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Wrapper for authenticated POST requests with JSON body
 */
export async function authenticatedPost<T = any>(
  url: string,
  data: any,
  options: RequestInit = {}
): Promise<T> {
  return authenticatedFetchJson<T>(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    },
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Wrapper for authenticated FormData POST requests
 */
export async function authenticatedPostFormData<T = any>(
  url: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<T> {
  return authenticatedFetchJson<T>(url, {
    method: "POST",
    body: formData,
    ...options,
  });
}

/**
 * Check if current authentication error indicates token expiry
 */
export function isAuthError(error: any): boolean {
  return (
    error?.message?.includes("Authentication") ||
    error?.message?.includes("Unauthorized") ||
    error?.message?.includes("Invalid or expired token")
  );
}

/**
 * Handle authentication errors by redirecting to login
 */
export function handleAuthError(error: any): void {
  if (isAuthError(error)) {
    // Clear invalid token
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("userProfile");
      localStorage.removeItem("uid");

      // Redirect to login
      window.location.href = "/login";
    }
  }
}
