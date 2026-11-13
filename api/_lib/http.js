import { createHash } from 'node:crypto';
import { getRateLimit, putRateLimit } from './db.js';

const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Cache-Control': 'no-store',
};

export function json(res, status, data) {
  res.statusCode = status;
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    res.setHeader(key, value);
  }
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

export function fail(res, status, message) {
  json(res, status, { ok: false, error: message });
}

export function methodNotAllowed(res, allowed) {
  res.setHeader('Allow', allowed.join(', '));
  fail(res, 405, 'Method not allowed');
}

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers['x-real-ip'] || req.socket?.remoteAddress || 'unknown';
}

export function hashValue(value) {
  return createHash('sha256')
    .update(`${process.env.IP_SALT || 'portfolio'}:${value}`)
    .digest('hex')
    .slice(0, 32);
}

export async function readJson(req, limit = 200_000) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        const error = new Error('Payload too large');
        error.statusCode = 413;
        reject(error);
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      if (chunks.length === 0) return resolve({});
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
      } catch {
        const error = new Error('Invalid JSON body');
        error.statusCode = 400;
        reject(error);
      }
    });

    req.on('error', reject);
  });
}

// Sliding-window counter stored in the database so limits survive restarts and
// work across serverless instances.
export async function rateLimit(key, limit, windowMs) {
  const now = Date.now();
  const existing = await getRateLimit(key);

  if (!existing || now - Number(existing.window_start) > windowMs) {
    await putRateLimit(key, now, 1);
    return { allowed: true, remaining: limit - 1, retryAfter: 0 };
  }

  const hits = Number(existing.hits) + 1;
  await putRateLimit(key, Number(existing.window_start), hits);

  if (hits > limit) {
    const retryAfter = Math.ceil((Number(existing.window_start) + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, retryAfter };
  }

  return { allowed: true, remaining: limit - hits, retryAfter: 0 };
}

export function tooManyRequests(res, retryAfter) {
  res.setHeader('Retry-After', String(retryAfter));
  fail(res, 429, 'Too many requests. Please try again later.');
}
