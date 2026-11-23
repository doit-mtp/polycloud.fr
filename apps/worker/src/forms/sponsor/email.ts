import type { Email } from '../../lib/resend';
import type { SponsorRequest } from './schema';

const EMPTY = '—';

/** The notification sent to the team for a request, with the requester as Reply-To. */
export function notificationEmail(
  request: SponsorRequest,
  { from, to }: { from: string; to: string },
): Email {
  const value = (text: string | null) => text || EMPTY;

  const text = [
    'Nouvelle demande de sponsoring reçue sur polycloud.fr.',
    '',
    `Entreprise : ${request.company}`,
    `Site web : ${value(request.website)}`,
    '',
    `Contact : ${request.contactName}`,
    `Fonction : ${value(request.role)}`,
    `E-mail : ${request.email}`,
    `Téléphone : ${value(request.phone)}`,
    '',
    `Palier : ${request.tier.label}`,
    '',
    'Message :',
    value(request.message),
    '',
    'Répondez directement à cet e-mail pour écrire au contact.',
  ].join('\n');

  return {
    from,
    to: [to],
    subject: `Demande de sponsoring : ${request.company} (${request.tier.label})`,
    text,
    replyTo: request.email,
  };
}
