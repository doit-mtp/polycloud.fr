import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

/**
 * Every error the API answers with. The site picks the message to show from the code;
 * only `invalid_fields` carries messages, written for the visitor.
 */
export type ErrorCode =
  | 'not_found'
  | 'method_not_allowed'
  | 'forbidden_origin'
  | 'unsupported_media_type'
  | 'payload_too_large'
  | 'invalid_body'
  | 'invalid_fields'
  | 'turnstile_failed'
  | 'server_error';

export interface ErrorBody {
  ok: false;
  error: ErrorCode;
  /** French message per invalid field, keyed by field name. */
  fields?: Record<string, string>;
}

/** A JSON error response. */
export function apiError(
  c: Context,
  status: ContentfulStatusCode,
  error: ErrorCode,
  fields?: Record<string, string>,
) {
  const body: ErrorBody = fields ? { ok: false, error, fields } : { ok: false, error };
  return c.json(body, status);
}
