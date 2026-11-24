import { Hono } from 'hono';

import { apiError } from '../../lib/errors';
import { sendEmail } from '../../lib/resend';
import type { AppEnv } from '../../types';
import { formBody, limitBody, requireHuman, requireJson } from '../middleware';
import { notificationEmail } from './email';
import { insertSponsorRequest } from './repository';
import { sponsorRequestBody } from './schema';

export const sponsorForm = new Hono<AppEnv>();

/** Receives a request from the sponsor form: checks it, stores it, then emails the team. */
sponsorForm.post(
  '/',
  requireJson,
  limitBody,
  formBody(sponsorRequestBody),
  requireHuman,
  async (c) => {
    const request = c.req.valid('json');

    const id = await insertSponsorRequest(c.env.DB, request, new Date());

    // Sent after answering, so a slow email service never keeps the visitor waiting.
    // If it fails, reading the API key included, the request is still in D1 and the answer a 201.
    const email = notificationEmail(request, { from: c.env.MAIL_FROM, to: c.env.MAIL_TO });
    c.executionCtx.waitUntil(
      c.env.RESEND_API_KEY.get()
        .then((apiKey) => sendEmail(apiKey, email))
        .catch((error) => console.error(`Could not email sponsor request ${id}`, error)),
    );

    return c.json({ ok: true } as const, 201);
  },
);

sponsorForm.all('/', (c) => {
  c.header('Allow', 'POST');
  return apiError(c, 405, 'method_not_allowed');
});
