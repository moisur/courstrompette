import { PrismaClient } from '@prisma/client';

declare global {
  var __prisma: PrismaClient | undefined;
}

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error('DATABASE_URL is not configured.');
  }

  return value;
}

/**
 * Prisma Client Singleton
 * This is the unified database access point for the entire application.
 */
export const prisma = globalThis.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prisma = prisma;
}

// Note: The deprecated dbQuery and pg Pool have been removed in favor of Prisma 
// to ensure type safety and schema consistency across the unified application.
