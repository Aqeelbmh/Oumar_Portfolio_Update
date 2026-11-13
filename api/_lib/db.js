import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

let client;
let ready;

function resolveUrl() {
  return (
    process.env.TURSO_DATABASE_URL ||
    process.env.DATABASE_URL ||
    'file:./data/portfolio.db'
  );
}

function assertConfigured(url) {
  if (!url.startsWith('file:') && !process.env.TURSO_AUTH_TOKEN) {
    throw new Error(
      'TURSO_DATABASE_URL is set but TURSO_AUTH_TOKEN is missing. Create one with: turso db tokens create <db-name>'
    );
  }
}

export function getDb() {
  if (!ready) {
    ready = init().catch((error) => {
      ready = undefined;
      throw error;
    });
  }
  return ready;
}

async function init() {
  if (!client) {
    const url = resolveUrl();
    assertConfigured(url);
    let module;

    if (url.startsWith('file:')) {
      mkdirSync(dirname(url.slice('file:'.length)), { recursive: true });
      // Node client supports local SQLite files (development).
      module = await import('@libsql/client');
    } else {
      // Web client has no native dependencies (Vercel/serverless).
      module = await import('@libsql/client/web');
    }

    client = module.createClient({
      url,
      authToken: process.env.TURSO_AUTH_TOKEN || undefined,
    });
  }

  await client.execute(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      message TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unread',
      ip_hash TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS idx_messages_status ON messages (status, created_at DESC)
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key TEXT PRIMARY KEY,
      window_start INTEGER NOT NULL,
      hits INTEGER NOT NULL
    )
  `);
  await client.execute(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      mime TEXT NOT NULL,
      size INTEGER NOT NULL,
      data BLOB NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  return client;
}

export async function getRateLimit(key) {
  const db = await getDb();
  const result = await db.execute({
    sql: 'SELECT window_start, hits FROM rate_limits WHERE key = ?',
    args: [key],
  });
  return result.rows[0] || null;
}

export async function putRateLimit(key, windowStart, hits) {
  const db = await getDb();
  await db.execute({
    sql: `INSERT INTO rate_limits (key, window_start, hits) VALUES (?, ?, ?)
          ON CONFLICT(key) DO UPDATE SET window_start = excluded.window_start, hits = excluded.hits`,
    args: [key, windowStart, hits],
  });
}
