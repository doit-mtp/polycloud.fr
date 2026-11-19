/**
 * Browser-side logic of the partner form (/sponsors), kept free of DOM code so it can be tested.
 * The payload matches `POST /forms/sponsor` of the Worker in apps/worker.
 */
import type { Choice } from '../data/sponsoring';

export interface SponsorPayload {
  company: string;
  website: string;
  contactName: string;
  role: string;
  email: string;
  phone: string;
  tier: Choice | undefined;
  message: string;
}

/** Request header carrying the Turnstile token, as expected by the Worker. */
export const TURNSTILE_HEADER = 'Turnstile-Token';

/**
 * Turns the submitted form into the API payload. The tier radio's value is a choice id,
 * looked up in `choices` so the API receives the label the visitor saw.
 */
export function buildPayload(data: FormData, choices: Record<string, Choice>): SponsorPayload {
  const text = (name: string) => String(data.get(name) ?? '');
  const choice = (id: FormDataEntryValue | null) => (id === null ? undefined : choices[String(id)]);

  return {
    company: text('company'),
    website: text('website'),
    contactName: text('contactName'),
    role: text('role'),
    email: text('email'),
    phone: text('phone'),
    tier: choice(data.get('tier')),
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
export function checkBeforeSend(token: string): string | null {
  // Turnstile fills its token a moment after the page loads, and again after each reset
  if (!token) {
    return 'Merci de patienter pendant la vérification anti-robot, puis réessayez.';
  }
  return null;
}
