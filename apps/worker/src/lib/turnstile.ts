import { z } from 'zod';

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

const siteverifyResponse = z.object({ success: z.boolean() });

/**
 * Asks Cloudflare whether a Turnstile token is valid. Any failure to get an answer counts as invalid.
 * @param token the `cf-turnstile-response` produced on the page
 * @param secret the widget's secret key
 * @param ip the visitor's IP, when known
 */
export async function verifyTurnstile(
  token: string,
  secret: string,
  ip: string | undefined,
): Promise<boolean> {
  if (!token) return false;

  const body = new FormData();
  body.append('secret', secret);
  body.append('response', token);
  if (ip) body.append('remoteip', ip);

  try {
    const response = await fetch(SITEVERIFY_URL, {
      method: 'POST',
      body,
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return false;
    const result = siteverifyResponse.safeParse(await response.json());
    return result.success && result.data.success;
  } catch (error) {
    console.error('Turnstile verification failed', error);
    return false;
  }
}
