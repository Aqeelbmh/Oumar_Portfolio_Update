import {
  json,
  fail,
  methodNotAllowed,
  readJson,
  rateLimit,
  tooManyRequests,
  getClientIp,
  hashValue,
} from '../_lib/http.js';
import {
  checkCredentials,
  createSessionToken,
  setSessionCookie,
  isConfigured,
} from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  if (!isConfigured()) {
    return fail(
      res,
      500,
      'Admin login is not configured. Set ADMIN_PASSWORD in the environment.'
    );
  }

  const ipHash = hashValue(getClientIp(req));

  try {
    const limit = await rateLimit(`login:${ipHash}`, 10, 15 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(res, limit.retryAfter);
  } catch (error) {
    console.error('Rate limit check failed:', error);
  }

  let body;
  try {
    body = await readJson(req, 5_000);
  } catch (error) {
    return fail(res, error.statusCode || 400, error.message || 'Invalid request');
  }

  const username = typeof body.username === 'string' ? body.username.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || !password || !checkCredentials(username, password)) {
    return fail(res, 401, 'Invalid username or password.');
  }

  setSessionCookie(req, res, createSessionToken(username));
  return json(res, 200, { ok: true, username });
}
