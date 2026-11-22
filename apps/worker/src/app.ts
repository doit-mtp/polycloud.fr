import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { HTTPException } from 'hono/http-exception';

import { forms } from './forms';
import { TURNSTILE_HEADER } from './forms/middleware';
import { apiError } from './lib/errors';
import type { AppEnv } from './types';

export const app = new Hono<AppEnv>();

// The API is only called by the site's pages. Checked before CORS so that any other origin,
// or a request without one, gets a 403, preflights included.
app.use(async (c, next) => {
  if (!allowedOrigin(c.req.header('Origin'), c.env.ALLOWED_ORIGINS))
    return apiError(c, 403, 'forbidden_origin');
  return next();
});

app.use(
  cors({
    origin: (origin, c) => allowedOrigin(origin, c.env.ALLOWED_ORIGINS),
    allowMethods: ['POST'],
    allowHeaders: ['Content-Type', TURNSTILE_HEADER],
    maxAge: 86400,
  }),
);

app.route('/forms', forms);

app.notFound((c) => apiError(c, 404, 'not_found'));

app.onError((error, c) => {
  // Thrown by the JSON validator when the body is not valid JSON.
  if (error instanceof HTTPException && error.status === 400)
    return apiError(c, 400, 'invalid_body');
  console.error(`${c.req.method} ${c.req.path} failed`, error);
  return apiError(c, 500, 'server_error');
});

/**
 * The origin when it is allowed to call the API, otherwise null.
 * @param allowed comma-separated list of origins
 */
function allowedOrigin(origin: string | undefined, allowed: string): string | null {
  if (!origin) return null;
  return allowed.split(',').some((o) => o.trim() === origin) ? origin : null;
}
