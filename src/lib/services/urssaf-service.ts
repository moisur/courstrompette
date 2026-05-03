import type { InscriptionParticulierDTO } from "@/lib/urssaf/schema";
import { logUrssafTrace } from "@/lib/urssaf/tracing";

const URSSAF_BASE_URL =
  process.env.URSSAF_BASE_URL?.trim() || "https://api-edi.urssaf.fr/atp/v1/tiersPrestations";
const URSSAF_OAUTH_TOKEN_URL =
  process.env.URSSAF_OAUTH_TOKEN_URL?.trim() || "https://api-edi.urssaf.fr/api/oauth/v1/token";
const TOKEN_REFRESH_SKEW_MS = 60_000;

type UrssafOAuthResponse = {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  scope?: string;
  [key: string]: unknown;
};

type TokenCacheEntry = {
  accessToken: string;
  expiresAt: number;
};

let tokenCache: TokenCacheEntry | null = null;
let pendingTokenPromise: Promise<string> | null = null;

export type UrssafClientData = InscriptionParticulierDTO;

export interface UrssafStatusResponse {
  idClient: string;
  statutTransmission?: {
    etat?: "OK" | "KO" | "INCONNU";
    code?: string;
    description?: string;
  };
  [key: string]: unknown;
}

export interface UrssafRequestResult<T = unknown> {
  status: number;
  data: T;
}

export class UrssafApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "UrssafApiError";
    this.status = status;
    this.payload = payload;
  }
}

export class UrssafConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UrssafConfigurationError";
  }
}

function getErrorMessage(payload: unknown, status: number) {
  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0];
    if (first && typeof first === "object" && "message" in first && typeof (first as { message?: unknown }).message === "string") {
      return (first as { message: string }).message;
    }
  }

  if (payload && typeof payload === "object") {
    const candidate = payload as Record<string, unknown>;
    if (typeof candidate.message === "string" && candidate.message.trim()) {
      return candidate.message;
    }
    if (typeof candidate.error === "string" && candidate.error.trim()) {
      return candidate.error;
    }
    if (typeof candidate.error_description === "string" && candidate.error_description.trim()) {
      return candidate.error_description;
    }
  }

  return `URSSAF API Error: ${status}`;
}

async function readPayload(response: Response) {
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

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new UrssafConfigurationError(`Variable d'environnement URSSAF manquante: ${name}`);
  }

  return value;
}

function getTokenScope() {
  return process.env.URSSAF_SCOPE?.trim() || "homeplus.tiersprestations";
}

function buildMaskedAuthResponse(payload: UrssafOAuthResponse) {
  return {
    tokenType: payload.token_type ?? "Bearer",
    expiresIn: payload.expires_in ?? null,
    scope: payload.scope ?? null,
  };
}

export class UrssafService {
  private static clearTokenCache() {
    tokenCache = null;
  }

  private static isTokenStillValid() {
    return Boolean(tokenCache && tokenCache.expiresAt > Date.now() + TOKEN_REFRESH_SKEW_MS);
  }

  private static async fetchAccessToken(forceRefresh = false): Promise<string> {
    if (!forceRefresh && this.isTokenStillValid() && tokenCache) {
      return tokenCache.accessToken;
    }

    if (!forceRefresh && pendingTokenPromise) {
      return pendingTokenPromise;
    }

    const refreshPromise = (async () => {
      const clientId = getRequiredEnv("URSSAF_CLIENT_ID");
      const clientSecret = getRequiredEnv("URSSAF_CLIENT_SECRET");
      const scope = getTokenScope();

      logUrssafTrace({
        method: "AUTH",
        phase: "REQUEST",
        label: "OAUTH CLIENT_CREDENTIALS",
        payload: {
          tokenUrl: URSSAF_OAUTH_TOKEN_URL,
          grantType: "client_credentials",
          scope,
          hasClientId: Boolean(clientId),
        },
      });

      const body = new URLSearchParams({
        grant_type: "client_credentials",
        scope,
      });

      const response = await fetch(URSSAF_OAUTH_TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
          Accept: "application/json",
        },
        body: body.toString(),
        cache: "no-store",
      });

      const payload = (await readPayload(response)) as UrssafOAuthResponse;

      logUrssafTrace({
        method: "AUTH",
        phase: "RESPONSE",
        label: "OAUTH CLIENT_CREDENTIALS",
        payload: response.ok ? buildMaskedAuthResponse(payload) : payload,
        status: response.status,
      });

      if (!response.ok) {
        throw new UrssafApiError(getErrorMessage(payload, response.status), response.status, payload);
      }

      const accessToken = payload.access_token?.trim();
      if (!accessToken) {
        throw new UrssafConfigurationError("La reponse OAuth URSSAF ne contient pas d'access_token.");
      }

      const expiresIn = typeof payload.expires_in === "number" && payload.expires_in > 0 ? payload.expires_in : 300;
      tokenCache = {
        accessToken,
        expiresAt: Date.now() + expiresIn * 1000,
      };

      return accessToken;
    })();

    pendingTokenPromise = refreshPromise;

    try {
      return await refreshPromise;
    } finally {
      if (pendingTokenPromise === refreshPromise) {
        pendingTokenPromise = null;
      }
    }
  }

  private static async getHeaders(forceRefresh = false) {
    const bearer = await this.fetchAccessToken(forceRefresh);

    return {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${bearer}`,
    };
  }

  private static async request<T>(path: string, init: RequestInit, retryUnauthorized = true): Promise<UrssafRequestResult<T>> {
    const response = await fetch(`${URSSAF_BASE_URL}${path}`, {
      ...init,
      headers: {
        ...(await this.getHeaders(!retryUnauthorized)),
        ...(init.headers ?? {}),
      },
      cache: "no-store",
    });

    const data = (await readPayload(response)) as T;

    if (response.status === 401 && retryUnauthorized) {
      this.clearTokenCache();
      return this.request<T>(path, init, false);
    }

    if (!response.ok) {
      throw new UrssafApiError(getErrorMessage(data, response.status), response.status, data);
    }

    return {
      status: response.status,
      data,
    };
  }

  static async getClientStatusRequest(idClient: string) {
    return this.request<UrssafStatusResponse>(`/particulier?idClient=${encodeURIComponent(idClient)}`, {
      method: "GET",
    });
  }

  static async getClientStatus(idClient: string): Promise<UrssafStatusResponse> {
    const result = await this.getClientStatusRequest(idClient);
    return result.data;
  }

  static async registerClientRequest(data: UrssafClientData) {
    return this.request<{ idClient: string }>("/particulier", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  static async registerClient(data: UrssafClientData): Promise<{ idClient: string }> {
    const result = await this.registerClientRequest(data);
    return result.data;
  }

  static async submitPaymentRequestRequest(payload: unknown[]) {
    return this.request<unknown[]>("/demandePaiement", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  static async submitPaymentRequest(payload: unknown[]) {
    const result = await this.submitPaymentRequestRequest(payload);
    return result.data;
  }

  static async searchPaymentRequestsRequest(payload: Record<string, unknown>) {
    return this.request<Record<string, unknown>>("/demandePaiement/rechercher", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  static async searchPaymentRequests(payload: Record<string, unknown>) {
    const result = await this.searchPaymentRequestsRequest(payload);
    return result.data;
  }
}
