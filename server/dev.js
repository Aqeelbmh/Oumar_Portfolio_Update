// Local development server: serves the static site and mounts the same /api
// handlers that Vercel runs in production. Not used in production.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || 'localhost';

const ROUTES = new Map([
  ['/api/content', '../api/content.js'],
  ['/api/contact', '../api/contact.js'],
  ['/api/messages', '../api/messages.js'],
  ['/api/assets', '../api/assets.js'],
  ['/media', '../api/assets.js'],
  ['/api/auth/login', '../api/auth/login.js'],
  ['/api/auth/logout', '../api/auth/logout.js'],
  ['/api/auth/me', '../api/auth/me.js'],
]);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.pdf': 'application/pdf',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

const handlers = new Map();
async function loadHandler(path) {
  if (!handlers.has(path)) {
    handlers.set(path, (await import(path)).default);
  }
  return handlers.get(path);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || HOST}`);

  if (url.pathname.startsWith('/api/') || ROUTES.has(url.pathname.replace(/\/+$/, ''))) {
    const modulePath = ROUTES.get(url.pathname.replace(/\/+$/, ''));
    if (!modulePath) return sendJson(res, 404, { ok: false, error: 'Not found' });

    try {
      const handler = await loadHandler(modulePath);
      await handler(req, res);
    } catch (error) {
      console.error(`API error on ${url.pathname}:`, error);
      if (!res.headersSent) sendJson(res, 500, { ok: false, error: 'Server error' });
    }
    return;
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname === '/') pathname = '/index.html';

  if (pathname.startsWith('/api/') || pathname.startsWith('/server')) {
    return sendJson(res, 404, { ok: false, error: 'Not found' });
  }

  const filePath = join(ROOT, normalize(pathname).replace(/^(\.\.[/\\])+/, ''));
  if (!filePath.startsWith(ROOT.endsWith(sep) ? ROOT : ROOT + sep)) {
    return sendJson(res, 403, { ok: false, error: 'Forbidden' });
  }

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw new Error('not a file');

    const data = await readFile(filePath);
    res.statusCode = 200;
    res.setHeader('Content-Type', MIME[extname(filePath).toLowerCase()] || 'application/octet-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('404 Not Found');
  }
});

function sendJson(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(data));
}

server.listen(PORT, () => {
  console.log(`Portfolio running at http://${HOST}:${PORT}`);
  console.log(`Admin panel at   http://${HOST}:${PORT}/admin.html`);
  if (!process.env.ADMIN_PASSWORD) {
    console.warn('ADMIN_PASSWORD is not set — admin login will be disabled.');
  }
});
