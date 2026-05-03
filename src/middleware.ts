import { NextResponse, NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminToken } from './lib/admin-auth';

/**
 * Middleware for Global Route Protection
 * Runs on the Edge Runtime.
 */
export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Protect Admin Routes (/admin/*)
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    
    // Verify token using our Edge-safe helper
    const session = token ? await verifyAdminToken(token) : null;

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('next', pathname + search);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Protect Admin API Routes (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    const session = token ? await verifyAdminToken(token) : null;

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin session required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
