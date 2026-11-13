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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  let body;
  try {
    body = await readJson(req, 30_000);
  } catch (error) {
    return fail(res, error.statusCode || 400, error.message || 'Invalid request');
  }

  // Honeypot: real visitors never fill this field, bots usually do.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json(res, 200, { ok: true });
  }

  const name = clean(body.name);
  const email = clean(body.email);
  const message = clean(body.message);

  if (!name || name.length > 100) {
    return fail(res, 400, 'Please enter your name (up to 100 characters).');
  }
  if (!email || email.length > 254 || !EMAIL_PATTERN.test(email)) {
    return fail(res, 400, 'Please enter a valid email address.');
  }
  if (!message || message.length < 2 || message.length > 5000) {
    return fail(res, 400, 'Please enter a message (up to 5000 characters).');
  }

  try {
    const ipHash = hashValue(getClientIp(req));
    const limit = await rateLimit(`contact:${ipHash}`, 5, 10 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(res, limit.retryAfter);

    const db = await getDb();
    await db.execute({
      sql: 'INSERT INTO messages (name, email, message, ip_hash) VALUES (?, ?, ?, ?)',
      args: [name, email, message, ipHash],
    });

    return json(res, 201, { ok: true });
  } catch (error) {
    console.error('Failed to save message:', error);
    return fail(res, 500, 'Could not send your message. Please try again.');
  }
}

function clean(value) {
  return typeof value === 'string' ? value.trim() : '';
}
