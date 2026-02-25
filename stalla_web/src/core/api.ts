import { API_BASE_URL } from "./constants";
import { clearSession, getToken } from "./storage";
import type { ApiResponse } from "./types";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

let unauthorizedHandler: (() => void) | null = null;

/** Registers a callback invoked when an authenticated request gets a 401. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  unauthorizedHandler = handler;
}

function failure(message: string): ApiResponse<never> {
  return { success: false, message };
}

export async function apiRequest<T>(
  path: string,
  method: HttpMethod = "GET",
  body?: unknown,
): Promise<ApiResponse<T>> {
  const token = getToken();

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    return failure("Impossible de joindre le serveur. Vérifiez votre connexion et réessayez.");
  }

  if (response.status === 401 && token) {
    clearSession();
    unauthorizedHandler?.();
  }

  try {
    const rawText = await response.text();
    if (rawText) return JSON.parse(rawText) as ApiResponse<T>;
  } catch {
    // fall through to the generic error below
  }
  return failure(`Réponse serveur invalide (HTTP ${response.status}).`);
}
