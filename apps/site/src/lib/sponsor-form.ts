/**
 * Browser-side logic of the partner form (/sponsors), kept free of DOM code so it can be tested.
 * The payload matches `POST /forms/sponsor` of the Worker in apps/worker.
 */

export interface SponsorPayload {
  company: string;
  website: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  /** A tier id; the Worker looks up its label. */
  tier: string | undefined;
  message: string;
}

/** Request header carrying the Turnstile token, as expected by the Worker. */
export const TURNSTILE_HEADER = 'Turnstile-Token';

/** Turns the submitted form into the API payload. */
export function buildPayload(data: FormData): SponsorPayload {
  const text = (name: string) => String(data.get(name) ?? '');

  return {
    company: text('company'),
    website: text('website'),
    contactName: text('contactName'),
    role: text('role'),
    email: text('email'),
    phone: text('phone'),
    tier: data.has('tier') ? text('tier') : undefined,
    message: text('message'),
  };
}

/** The token Turnstile put in the form, sent in the `Turnstile-Token` header. */
export function turnstileToken(data: FormData): string {
  return String(data.get('cf-turnstile-response') ?? '');
}

/** Wraps `fn` so that calls made while a previous call is still running are ignored (double clicks). */
export function submitOnce<T>(fn: () => Promise<T>): () => Promise<T | undefined> {
  let pending = false;
  return async () => {
    if (pending) return undefined;
    pending = true;
    try {
      return await fn();
    } finally {
      pending = false;
    }
  };
}

/** The message shown when the API refuses the request for a reason other than invalid fields. */
export function errorMessage(status: number, body: unknown, email: string): string {
  const error =
    typeof body === 'object' && body !== null && 'error' in body ? body.error : undefined;
  if (status === 403 && error === 'turnstile_failed') {
    return 'La vérification anti-robot a expiré, merci de réessayer.';
  }
  return `L'envoi a échoué. Réessayez, ou écrivez-nous à ${email}.`;
}

/** A message to show instead of sending, or null when the form can be sent. */
export function checkBeforeSend(
  token: string,
  turnstileUnavailable: boolean,
  email: string,
): string | null {
  if (!token && turnstileUnavailable) {
    return `La vérification anti-robot n'a pas pu se charger (bloqueur de publicité ?). Écrivez-nous à ${email}.`;
  }
  // Turnstile fills its token a moment after the page loads, and again after each reset
  if (!token) {
    return 'Merci de patienter pendant la vérification anti-robot, puis réessayez.';
  }
  return null;
}
