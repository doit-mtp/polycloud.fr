export interface Email {
  from: string;
  to: string[];
  subject: string;
  text: string;
  replyTo?: string;
}

/** Sends a plain-text email through Resend. Throws when Resend does not accept it. */
export async function sendEmail(apiKey: string, email: Email): Promise<void> {
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: email.from,
      to: email.to,
      subject: email.subject,
      text: email.text,
      reply_to: email.replyTo,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Resend answered ${response.status}: ${await response.text()}`);
}
