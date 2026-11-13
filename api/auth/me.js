import { json, methodNotAllowed } from '../_lib/http.js';
import { getSession } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
  const session = getSession(req);
  return json(res, 200, {
    authenticated: Boolean(session),
    username: session ? session.sub : null,
  });
}
