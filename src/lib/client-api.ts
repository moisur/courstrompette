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

function getErrorMessage(payload: unknown, fallback: string) {
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0];
    if (first && typeof first === "object") {
      const candidate = first as Record<string, unknown>;
      if (typeof candidate.message === "string" && candidate.message.trim()) {
        return candidate.message;
      }
      if (typeof candidate.description === "string" && candidate.description.trim()) {
        return candidate.description;
      }
      if (typeof candidate.code === "string" && candidate.code.trim()) {
        return candidate.code;
      }
    }
  }

  if (payload && typeof payload === "object" && "error" in payload) {
    const error = (payload as any).error;
    if (typeof error === "string" && error.trim()) {
      return error;
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
