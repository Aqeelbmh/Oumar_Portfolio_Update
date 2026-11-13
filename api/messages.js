import { getDb } from './_lib/db.js';
import { json, fail, methodNotAllowed, readJson } from './_lib/http.js';
import { requireAuth } from './_lib/auth.js';

const STATUSES = new Set(['unread', 'read', 'archived']);

export default async function handler(req, res) {
  if (req.method === 'GET') return listMessages(req, res);
  if (req.method === 'PATCH') return updateMessage(req, res);
  if (req.method === 'DELETE') return deleteMessage(req, res);
  return methodNotAllowed(res, ['GET', 'PATCH', 'DELETE']);
}

async function listMessages(req, res) {
  if (!requireAuth(req, res)) return;

  const url = new URL(req.url, 'http://localhost');
  const status = url.searchParams.get('status') || 'all';

  try {
    const db = await getDb();

    const filter = STATUSES.has(status) ? 'WHERE status = ?' : '';
    const result = await db.execute({
      sql: `SELECT id, name, email, message, status, created_at
            FROM messages ${filter}
            ORDER BY datetime(created_at) DESC, id DESC
            LIMIT 200`,
      args: STATUSES.has(status) ? [status] : [],
    });

    const counts = await db.execute(
      `SELECT status, COUNT(*) AS total FROM messages GROUP BY status`
    );

    const stats = { total: 0, unread: 0, read: 0, archived: 0 };
    for (const row of counts.rows) {
      const key = String(row.status);
      const total = Number(row.total) || 0;
      if (key in stats) stats[key] = total;
      stats.total += total;
    }

    return json(res, 200, {
      ok: true,
      messages: result.rows.map((row) => ({
        id: Number(row.id),
        name: row.name,
        email: row.email,
        message: row.message,
        status: row.status,
        createdAt: row.created_at,
      })),
      stats,
    });
  } catch (error) {
    console.error('Failed to list messages:', error);
    return fail(res, 500, 'Could not load messages');
  }
}

async function updateMessage(req, res) {
  if (!requireAuth(req, res)) return;

  let body;
  try {
    body = await readJson(req, 5_000);
  } catch (error) {
    return fail(res, error.statusCode || 400, error.message || 'Invalid request');
  }

  const id = Number(body.id);
  const status = String(body.status || '');
  if (!Number.isInteger(id) || id <= 0) return fail(res, 400, 'Invalid message id');
  if (!STATUSES.has(status)) return fail(res, 400, 'Invalid status');

  try {
    const db = await getDb();
    await db.execute({
      sql: 'UPDATE messages SET status = ? WHERE id = ?',
      args: [status, id],
    });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('Failed to update message:', error);
    return fail(res, 500, 'Could not update message');
  }
}

async function deleteMessage(req, res) {
  if (!requireAuth(req, res)) return;

  const url = new URL(req.url, 'http://localhost');
  const id = Number(url.searchParams.get('id'));
  if (!Number.isInteger(id) || id <= 0) return fail(res, 400, 'Invalid message id');

  try {
    const db = await getDb();
    await db.execute({ sql: 'DELETE FROM messages WHERE id = ?', args: [id] });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('Failed to delete message:', error);
    return fail(res, 500, 'Could not delete message');
  }
}
