import { Pool, type QueryResultRow } from 'pg';

declare global {
  var __pgPool: Pool | undefined;
}

function getDatabaseUrl() {
  const value = process.env.DATABASE_URL;

  if (!value) {
    throw new Error('DATABASE_URL is not configured.');
  }

  return value;
}

export function getPool() {
  if (!globalThis.__pgPool) {
    globalThis.__pgPool = new Pool({
      connectionString: getDatabaseUrl(),
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined,
    });
  }

  return globalThis.__pgPool;
}

export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  return getPool().query<T>(text, params);
}
