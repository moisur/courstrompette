export type UserRole = "ADMIN" | "STUDENT";

export interface AuthUser {
  id: string;
  email: string | null;
  role: UserRole;
  studentId?: string;
  mustChangePassword: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface StudentSummary {
  totalLessons: number;
  paidLessons: number;
  unpaidLessons: number;
  totalAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  activePacks: number;
}

export interface StudentItem {
  _id: string;
  name: string;
  rate: number;
  archived?: boolean;
}

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? "https://your-domain.tld";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function me(accessToken: string): Promise<{ user: AuthUser }> {
  return request<{ user: AuthUser }>("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function refresh(refreshToken: string): Promise<LoginResponse> {
  return request<LoginResponse>("/api/auth/refresh", {
    method: "POST",
    body: JSON.stringify({
      refreshToken,
    }),
  });
}

export async function logout(refreshToken: string): Promise<void> {
  await request<{ success: boolean }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({
      refreshToken,
    }),
  });
}

export async function fetchStudents(accessToken: string): Promise<StudentItem[]> {
  return request<StudentItem[]>("/api/students", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function fetchStudentSummary(accessToken: string): Promise<StudentSummary> {
  return request<StudentSummary>("/api/me/summary", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
