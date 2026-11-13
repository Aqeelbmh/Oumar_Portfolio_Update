import { getDb } from './_lib/db.js';
import {
  json,
  fail,
  methodNotAllowed,
  readJson,
  rateLimit,
  tooManyRequests,
  getClientIp,
  hashValue,
} from './_lib/http.js';
import { DEFAULT_CONTENT, normalizeContent } from './_lib/content.js';
import { requireAuth } from './_lib/auth.js';

export default async function handler(req, res) {
  if (req.method === 'GET') return getContent(res);
  if (req.method === 'PUT') return saveContent(req, res);
  return methodNotAllowed(res, ['GET', 'PUT']);
}

async function getContent(res) {
  try {
    const db = await getDb();
    const result = await db.execute({
      sql: "SELECT value, updated_at FROM content WHERE key = 'site'",
      args: [],
    });
    const row = result.rows[0];

    let saved = null;
    if (row) {
      try {
        saved = JSON.parse(row.value);
      } catch {
        console.error('Stored content is not valid JSON; using defaults.');
      }
    }

    const content = normalizeContent(saved);
    return json(res, 200, {
      ok: true,
      content,
      updatedAt: row ? row.updated_at : null,
    });
  } catch (error) {
    console.error('Failed to load content:', error);
    return fail(res, 500, 'Could not load content');
  }
}

async function saveContent(req, res) {
  if (!requireAuth(req, res)) return;

  try {
    const limit = await rateLimit(
      `content-save:${hashValue(getClientIp(req))}`,
      30,
      10 * 60 * 1000
    );
    if (!limit.allowed) return tooManyRequests(res, limit.retryAfter);

    const body = await readJson(req);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return fail(res, 400, 'Expected a content object');
    }

    const content = normalizeContent(body.content ?? body);
    const payload = JSON.stringify(content);

    const db = await getDb();
    await db.execute({
      sql: `INSERT INTO content (key, value, updated_at) VALUES ('site', ?, datetime('now'))
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = datetime('now')`,
      args: [payload],
    });

    await pruneStaleAssets(db, payload).catch((error) => {
      console.error('Asset cleanup failed:', error);
    });

    return json(res, 200, { ok: true, content });
  } catch (error) {
    if (error.statusCode) return fail(res, error.statusCode, error.message);
    console.error('Failed to save content:', error);
    return fail(res, 500, 'Could not save content');
  }
}

// Uploaded images are only reachable through the content document. Once an
// upload is no longer referenced (and has had an hour to be saved), drop it.
async function pruneStaleAssets(db, payload) {
  const result = await db.execute(
    "SELECT id FROM assets WHERE created_at < datetime('now', '-1 hour')"
  );
  const stale = result.rows
    .map((row) => String(row.id))
    .filter((id) => !payload.includes(id));
  if (stale.length === 0) return;

  const placeholders = stale.map(() => '?').join(', ');
  await db.execute({
    sql: `DELETE FROM assets WHERE id IN (${placeholders})`,
    args: stale,
  });
}
