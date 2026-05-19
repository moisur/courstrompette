import { cookies } from 'next/headers';
import { verifyPassword } from '@/lib/auth/security';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createSessionToken,
  isAdminAuthConfigured,
} from './admin-auth';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function getRequiredEnv(name: 'ADMIN_EMAIL' | 'ADMIN_PASSWORD' | 'ADMIN_SESSION_SECRET') {
  const value = process.env[name]?.trim();
  if (!value) return '';
  return value;
}

export async function authenticateAdmin(email: string, password: string) {
  if (!isAdminAuthConfigured()) return false;

  const normalizedEmail = normalizeEmail(email);
  const expectedEmail = normalizeEmail(getRequiredEnv('ADMIN_EMAIL'));

  if (normalizedEmail !== expectedEmail) {
    console.log(`[AUTH DEBUG] Échec de connexion : l'email saisi "${normalizedEmail}" ne correspond pas à l'email attendu "${expectedEmail}"`);
    return false;
  }

  const expectedHash = process.env.ADMIN_PASSWORD_HASH?.trim();
  const expectedClearPassword = process.env.ADMIN_PASSWORD?.trim();

  let isPasswordValid = false;

  if (expectedHash) {
    try {
      isPasswordValid = await verifyPassword(password, expectedHash);
    } catch (err) {
      console.error('[AUTH DEBUG] Erreur lors de la vérification du hash bcrypt :', err);
      return false;
    }
  } else if (expectedClearPassword) {
    console.warn(
      'SECURITY WARNING: Admin is authenticating using a cleartext password. Please configure ADMIN_PASSWORD_HASH in environment variables.'
    );
    isPasswordValid = password === expectedClearPassword;
  }

  if (!isPasswordValid) {
    console.log(`[AUTH DEBUG] Échec de connexion : le mot de passe est incorrect pour l'email "${normalizedEmail}"`);
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
