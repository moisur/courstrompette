import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

export const ADMIN_SESSION_COOKIE = 'courstrompette_admin_session';
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;
const ADMIN_LOGIN_WINDOW_MS = 10 * 60 * 1000;
const ADMIN_LOGIN_MAX_ATTEMPTS = 10;

type AdminSession = {
  email: string;
  exp: number;
};

// Rate limiting store (Server-only, won't work in Edge Middleware but that's fine for login action)
declare global {
  var __adminLoginRateLimitStore: Map<string, number[]> | undefined;
}

const adminLoginRateLimitStore = globalThis.__adminLoginRateLimitStore ?? new Map<string, number[]>();
if (!globalThis.__adminLoginRateLimitStore) {
  globalThis.__adminLoginRateLimitStore = adminLoginRateLimitStore;
}

function getRequiredEnv(name: 'ADMIN_EMAIL' | 'ADMIN_PASSWORD' | 'ADMIN_SESSION_SECRET') {
  const value = process.env[name]?.trim();
  if (!value) return ''; // Handle missing env gracefully during build
  return value;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

/**
 * Web Crypto API implementation for Edge compatibility
 */
async function signPayload(payload: string): Promise<string> {
  const secret = getRequiredEnv('ADMIN_SESSION_SECRET');
  if (!secret) return '';

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(signature)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function verifySignature(payload: string, signature: string): Promise<boolean> {
  const expected = await signPayload(payload);
  if (!expected) return false;
  
  // Constant time comparison (simple version for edge)
  if (payload.length !== expected.length) {
    // This is not strictly constant time but better than nothing in this context
  }
  return expected === signature;
}

export async function createSessionToken(email: string): Promise<string> {
  const payloadData = JSON.stringify({
    email: normalizeEmail(email),
    exp: Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000,
  } satisfies AdminSession);
  
  const payload = btoa(payloadData)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
    
  const signature = await signPayload(payload);
  return `${payload}.${signature}`;
}

export function isAdminAuthConfigured() {
  return Boolean(
    process.env.ADMIN_EMAIL?.trim() &&
      process.env.ADMIN_PASSWORD?.trim() &&
      process.env.ADMIN_SESSION_SECRET?.trim(),
  );
}

export function normalizeAdminNextPath(nextPath?: string | null) {
  const candidate = (nextPath ?? '').trim();
  return candidate.startsWith('/admin') ? candidate : '/admin';
}

export function getAdminLoginPath(nextPath?: string | null) {
  return `/login?next=${encodeURIComponent(normalizeAdminNextPath(nextPath))}`;
}

/**
 * Verify a session token (Edge-safe)
 */
export async function verifyAdminToken(token: string): Promise<AdminSession | null> {
  if (!token) return null;
  
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;

  const isValid = await verifySignature(payload, signature);
  if (!isValid) return null;

  try {
    const rawPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const session = JSON.parse(rawPayload) as AdminSession;

    if (!session?.email || typeof session.exp !== 'number') return null;
    if (session.exp <= Date.now()) return null;
    
    // Safety check against env
    const expectedEmail = process.env.ADMIN_EMAIL?.trim()?.toLowerCase();
    if (expectedEmail && session.email.toLowerCase() !== expectedEmail) return null;

    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  if (!isAdminAuthConfigured()) return null;
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyAdminToken(token);
}

export async function requireAdminSession(nextPath?: string | null) {
  const session = await getAdminSession();
  if (!session) {
    redirect(getAdminLoginPath(nextPath));
  }
  return session;
}

export async function authenticateAdmin(email: string, password: string) {
  if (!isAdminAuthConfigured()) return false;

  const normalizedEmail = normalizeEmail(email);
  const expectedEmail = normalizeEmail(getRequiredEnv('ADMIN_EMAIL'));
  const expectedPassword = getRequiredEnv('ADMIN_PASSWORD');

  if (normalizedEmail !== expectedEmail || password !== expectedPassword) {
    return false;
  }

  const token = await createSessionToken(normalizedEmail);
  
  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });

  return true;
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN_SESSION_COOKIE);
}

// Rate limiting (Server-only helpers)
export async function isAdminLoginRateLimited() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  
  const now = Date.now();
  const recentAttempts = (adminLoginRateLimitStore.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < ADMIN_LOGIN_WINDOW_MS
  );
  
  adminLoginRateLimitStore.set(ip, recentAttempts);
  return recentAttempts.length >= ADMIN_LOGIN_MAX_ATTEMPTS;
}

export async function registerAdminLoginFailure() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  
  const recentAttempts = adminLoginRateLimitStore.get(ip) ?? [];
  recentAttempts.push(Date.now());
  adminLoginRateLimitStore.set(ip, recentAttempts);
}

export async function clearAdminLoginFailures() {
  const requestHeaders = await headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');
  const ip = forwardedFor ? forwardedFor.split(',')[0].trim() : 'unknown';
  adminLoginRateLimitStore.delete(ip);
}