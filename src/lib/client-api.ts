export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

interface ApiRequestOptions extends RequestInit {
  redirectOnUnauthorized?: boolean;
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (!payload) return fallback;

  // 1. Cas d'un tableau de payload (ex: format URSSAF)
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0];
    if (first && typeof first === "object") {
      const candidate = first as Record<string, unknown>;

      // Vérification des erreurs imbriquées (ex: candidate.errors[0].message)
      if (Array.isArray(candidate.errors) && candidate.errors.length > 0) {
        const nestedFirst = candidate.errors[0];
        if (nestedFirst && typeof nestedFirst === "object") {
          const nested = nestedFirst as Record<string, unknown>;
          if (typeof nested.message === "string" && nested.message.trim()) {
            return nested.message;
          }
          if (typeof nested.description === "string" && nested.description.trim()) {
            return nested.description;
          }
          if (typeof nested.code === "string" && nested.code.trim()) {
            return nested.code;
          }
        }
      }

      // Propriétés directes de l'élément de l'URSSAF
      if (typeof candidate.message === "string" && candidate.message.trim()) {
        return candidate.message;
      }
      if (typeof candidate.description === "string" && candidate.description.trim()) {
        return candidate.description;
      }
      if (typeof candidate.code === "string" && candidate.code.trim()) {
        return candidate.code;
      }
      if (typeof candidate.statut === "string" && candidate.statut.trim()) {
        return candidate.statut;
      }
    }
  }

  // 2. Cas d'un objet standard
  if (typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    // Champ 'error' direct (souvent renvoyé par nos routes d'API)
    if ("error" in obj) {
      const error = obj.error;
      if (typeof error === "string" && error.trim()) {
        return error;
      }
    }

    // Tableau d'erreurs direct 'errors'
    if (Array.isArray(obj.errors) && obj.errors.length > 0) {
      const firstErr = obj.errors[0];
      if (firstErr && typeof firstErr === "object") {
        const nested = firstErr as Record<string, unknown>;
        if (typeof nested.message === "string" && nested.message.trim()) {
          return nested.message;
        }
        if (typeof nested.description === "string" && nested.description.trim()) {
          return nested.description;
        }
      }
    }

    // Champs standards
    if (typeof obj.message === "string" && obj.message.trim()) {
      return obj.message;
    }
    if (typeof obj.description === "string" && obj.description.trim()) {
      return obj.description;
    }
  }

  return fallback;
}

async function readPayload(response: Response) {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();
  if (!text) {
    return undefined;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

export async function apiRequest<T>(
  path: string,
  { redirectOnUnauthorized = true, headers, ...init }: ApiRequestOptions = {},
): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
  });

  const payload = await readPayload(response);

  if (response.status === 401 && redirectOnUnauthorized && typeof window !== "undefined") {
    window.location.href = "/login";
  }

  if (!response.ok) {
    throw new ApiError(getErrorMessage(payload, `HTTP ${response.status}`), response.status, payload);
  }

  return payload as T;
}
