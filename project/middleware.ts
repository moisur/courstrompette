import { NextRequest, NextResponse } from "next/server";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/constants";

const PUBLIC_PATHS = new Set(["/login"]);
const PUBLIC_API_PATHS = new Set(["/api/auth/login", "/api/auth/refresh"]);

function isPublicAsset(pathname: string): boolean {
  return (
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".ico")
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicAsset(pathname)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api")) {
    if (PUBLIC_API_PATHS.has(pathname)) {
      return NextResponse.next();
    }
    return NextResponse.next();
  }

  const hasAccessCookie = Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value);

  if (PUBLIC_PATHS.has(pathname)) {
    if (hasAccessCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (!hasAccessCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
