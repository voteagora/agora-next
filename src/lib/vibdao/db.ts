import { Pool, type QueryResultRow } from 'pg';
import { getDatabaseUrl } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __vibdaoPool: Pool | undefined;
}

export const pool =
  global.__vibdaoPool ??
  new Pool({
    connectionString: getDatabaseUrl(),
    max: 10,
  });

if (process.env.NODE_ENV !== 'production') {
  global.__vibdaoPool = pool;
}

export async function query<T extends QueryResultRow>(text: string, values: unknown[] = []): Promise<T[]> {
  const result = await pool.query<T>(text, values);
  return result.rows;
}

export async function ensureAppSchema(): Promise<void> {
  await pool.query('create schema if not exists app');
  await pool.query(`
    create table if not exists app.proposal_metadata (
      proposal_id text primary key,
      title text not null,
      summary text,
      body text,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);
}
