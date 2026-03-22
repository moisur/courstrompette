import crypto from 'crypto';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

const ADMIN_SESSION_COOKIE = 'courstrompette_admin_session';
const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;
const ADMIN_LOGIN_WINDOW_MS = 10 * 60 * 1000;
const ADMIN_LOGIN_MAX_ATTEMPTS = 10;

type AdminSession = {
  email: string;
  exp: number;
};

declare global {
  var __adminLoginRateLimitStore: Map<string, number[]> | undefined;
}

const adminLoginRateLimitStore = globalThis.__adminLoginRateLimitStore ?? new Map<string, number[]>();
if (!globalThis.__adminLoginRateLimitStore) {
  globalThis.__adminLoginRateLimitStore = adminLoginRateLimitStore;
}

function getRequiredEnv(name: 'ADMIN_EMAIL' | 'ADMIN_PASSWORD' | 'ADMIN_SESSION_SECRET') {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function createCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function signPayload(payload: string) {
  return crypto
    .createHmac('sha256', getRequiredEnv('ADMIN_SESSION_SECRET'))
    .update(payload)
    .digest('base64url');
}

function createSessionToken(email: string) {
  const payload = Buffer.from(
    JSON.stringify({
      email: normalizeEmail(email),
      exp: Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000,
    } satisfies AdminSession),
    'utf8',
  ).toString('base64url');

  return `${payload}.${signPayload(payload)}`;
}

function getRequestIp() {
  const requestHeaders = headers();
  const forwardedFor = requestHeaders.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return requestHeaders.get('x-real-ip') || 'unknown';
}

function getRecentAttempts(ip: string) {
  const now = Date.now();
  const recentAttempts = (adminLoginRateLimitStore.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < ADMIN_LOGIN_WINDOW_MS,
  );

  adminLoginRateLimitStore.set(ip, recentAttempts);
  return recentAttempts;
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

export function isAdminLoginRateLimited() {
  const ip = getRequestIp();
  return getRecentAttempts(ip).length >= ADMIN_LOGIN_MAX_ATTEMPTS;
}

export function registerAdminLoginFailure() {
  const ip = getRequestIp();
  const recentAttempts = getRecentAttempts(ip);
  recentAttempts.push(Date.now());
  adminLoginRateLimitStore.set(ip, recentAttempts);
}

export function clearAdminLoginFailures() {
  adminLoginRateLimitStore.delete(getRequestIp());
}

export function getAdminSession() {
  if (!isAdminAuthConfigured()) {
    return null;
  }

  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const [payload, signature] = token.split('.');

  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(payload);

  if (!safeEqual(signature, expectedSignature)) {
    return null;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession;

    if (!session?.email || typeof session.exp !== 'number') {
      return null;
    }

    if (session.exp <= Date.now()) {
      return null;
    }

    if (normalizeEmail(session.email) !== normalizeEmail(getRequiredEnv('ADMIN_EMAIL'))) {
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function requireAdminSession(nextPath?: string | null) {
  const session = getAdminSession();

  if (!session) {
    redirect(getAdminLoginPath(nextPath));
  }

  return session;
}

export function authenticateAdmin(email: string, password: string) {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  const normalizedEmail = normalizeEmail(email);
  const expectedEmail = normalizeEmail(getRequiredEnv('ADMIN_EMAIL'));
  const expectedPassword = getRequiredEnv('ADMIN_PASSWORD');

  if (!safeEqual(normalizedEmail, expectedEmail)) {
    return false;
  }

  if (!safeEqual(password, expectedPassword)) {
    return false;
  }

  cookies().set(
    ADMIN_SESSION_COOKIE,
    createSessionToken(normalizedEmail),
    createCookieOptions(ADMIN_SESSION_TTL_SECONDS),
  );

  return true;
}

export function clearAdminSession() {
  cookies().set(ADMIN_SESSION_COOKIE, '', createCookieOptions(0));
}