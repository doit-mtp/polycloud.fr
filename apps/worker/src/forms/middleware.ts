import { zValidator } from '@hono/zod-validator';
import { bodyLimit } from 'hono/body-limit';
import { createMiddleware } from 'hono/factory';
import { z } from 'zod';

import { apiError } from '../lib/errors';
import { verifyTurnstile } from '../lib/turnstile';
import type { AppEnv } from '../types';

/** Request header carrying the Turnstile token (`cf-turnstile-response` on the page). */
export const TURNSTILE_HEADER = 'Turnstile-Token';

const MAX_BODY_BYTES = 32 * 1024;

/** Only JSON bodies are accepted, which also makes every browser call a preflighted CORS request. */
export const requireJson = createMiddleware(async (c, next) => {
  const mediaType = c.req.header('Content-Type')?.split(';')[0]?.trim().toLowerCase();
  if (mediaType !== 'application/json') return apiError(c, 415, 'unsupported_media_type');
  return next();
});

/** Refuses bodies over 32 KB, far more than any form needs. */
export const limitBody = bodyLimit({
  maxSize: MAX_BODY_BYTES,
  onError: (c) => apiError(c, 413, 'payload_too_large'),
});

/**
 * Validates the JSON body against a form schema. On failure, answers with the first message of
 * each invalid field, for the form to show next to it.
 */
export const formBody = <T extends z.ZodType>(schema: T) =>
  zValidator('json', schema, (result, c) => {
    if (result.success) return;
    const { formErrors, fieldErrors } = z.flattenError(result.error);
    if (formErrors.length > 0) return apiError(c, 400, 'invalid_body');
    const fields = Object.fromEntries(
      Object.entries(fieldErrors as Record<string, string[] | undefined>).flatMap(
        ([field, messages]) => (messages?.[0] ? [[field, messages[0]]] : []),
      ),
    );
    return apiError(c, 400, 'invalid_fields', fields);
  });

/**
 * Checks the Turnstile token sent in the `Turnstile-Token` header.
 * Placed after the body validation, so that a visitor fixing a field keeps a valid token.
 */
export const requireHuman = createMiddleware<AppEnv>(async (c, next) => {
  const human = await verifyTurnstile(
    c.req.header(TURNSTILE_HEADER) ?? '',
    await c.env.TURNSTILE_SECRET.get(),
    c.req.header('CF-Connecting-IP'),
  );
  if (!human) return apiError(c, 403, 'turnstile_failed');
  return next();
});
