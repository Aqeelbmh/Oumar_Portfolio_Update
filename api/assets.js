import { randomBytes } from 'node:crypto';
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
import { requireAuth } from './_lib/auth.js';

const MAX_DATA_URL = 4_100_000;
const MAX_BYTES = 3_000_000;
const DATA_URL_PATTERN =
  /^data:((?:image\/(?:jpeg|png|webp|gif))|application\/pdf);base64,([A-Za-z0-9+/=]+)$/;
const ID_PATTERN = /^[a-f0-9]{24}$/;

export default async function handler(req, res) {
  if (req.method === 'GET') return getAsset(req, res);
  if (req.method === 'POST') return uploadAsset(req, res);
  return methodNotAllowed(res, ['GET', 'POST']);
}

async function getAsset(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const id = url.searchParams.get('id') || '';
  if (!ID_PATTERN.test(id)) return fail(res, 400, 'Invalid asset id');

  try {
    const db = await getDb();
    const result = await db.execute({
      sql: 'SELECT mime, data FROM assets WHERE id = ?',
      args: [id],
    });
    const row = result.rows[0];
    if (!row) return fail(res, 404, 'Asset not found');

    const bytes = toBuffer(row.data);
    res.statusCode = 200;
    res.setHeader('Content-Type', row.mime);
    res.setHeader('Content-Length', String(bytes.length));
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.end(bytes);
  } catch (error) {
    console.error('Failed to load asset:', error);
    return fail(res, 500, 'Could not load file');
  }
}

async function uploadAsset(req, res) {
  if (!requireAuth(req, res)) return;

  try {
    const limit = await rateLimit(`upload:${hashValue(getClientIp(req))}`, 30, 10 * 60 * 1000);
    if (!limit.allowed) return tooManyRequests(res, limit.retryAfter);

    const body = await readJson(req, 4_200_000);
    const dataUrl = typeof body?.dataUrl === 'string' ? body.dataUrl : '';
    if (dataUrl.length > MAX_DATA_URL) {
      return fail(res, 413, 'File is too large. Please choose a smaller file.');
    }

    const match = DATA_URL_PATTERN.exec(dataUrl);
    if (!match) return fail(res, 400, 'Expected a JPEG, PNG, WebP, GIF or PDF file.');

    const mime = match[1];
    const data = Buffer.from(match[2], 'base64');
    if (data.length < 64) return fail(res, 400, 'That file is empty.');
    if (data.length > MAX_BYTES) {
      return fail(res, 413, 'File is too large. Please choose a smaller file.');
    }

    const id = randomBytes(12).toString('hex');
    const db = await getDb();
    await db.execute({
      sql: 'INSERT INTO assets (id, mime, size, data) VALUES (?, ?, ?, ?)',
      args: [id, mime, data.length, new Uint8Array(data)],
    });

    return json(res, 201, { ok: true, url: `/media?id=${id}`, size: data.length, mime });
  } catch (error) {
    if (error.statusCode) return fail(res, error.statusCode, error.message);
    console.error('Failed to upload asset:', error);
    return fail(res, 500, 'Could not save that file');
  }
}

function toBuffer(value) {
  if (!value) return Buffer.alloc(0);
  if (Buffer.isBuffer(value)) return value;
  if (value instanceof ArrayBuffer) return Buffer.from(value);
  if (ArrayBuffer.isView(value)) {
    return Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  }
  return Buffer.from(String(value), 'base64');
}
