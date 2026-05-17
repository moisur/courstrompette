import { NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE,
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_TOKEN_COOKIE,
  REFRESH_TOKEN_TTL_SECONDS,
} from "@/lib/auth/constants";

function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((acc, part) => {
    const [key, ...valueParts] = part.trim().split("=");
    if (!key) {
      return acc;
    }
    acc[key] = decodeURIComponent(valueParts.join("="));
    return acc;
  }, {});
}

export function getRequestCookie(request: Request, cookieName: string): string | null {
  const cookies = parseCookieHeader(request.headers.get("cookie"));
  return cookies[cookieName] ?? null;
}

export function setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string): void {
  const secure = process.env.NODE_ENV === "production";

  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: ACCESS_TOKEN_TTL_SECONDS,
    path: "/",
  });

  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: refreshToken,
    httpOnly: true,
    sameSite: "lax",
    secure,
    maxAge: REFRESH_TOKEN_TTL_SECONDS,
    path: "/",
  });
}

export function clearAuthCookies(response: NextResponse): void {
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set({
    name: REFRESH_TOKEN_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/",
  });
}
