import { z } from 'zod';

/** Field messages shown to the visitor, in French. */
export const messages = {
  required: 'Champ obligatoire.',
  invalid: 'Valeur invalide.',
  badChoice: 'Choix invalide.',
  badEmail: 'Adresse e-mail invalide.',
  tooLong: (max: number) => `Trop long (${max} caractères max).`,
};

/** A trimmed, non-empty string. */
export const requiredText = (max: number) =>
  z
    .string({ error: messages.required })
    .trim()
    .min(1, messages.required)
    .max(max, messages.tooLong(max));

/** A trimmed string, where missing, null and empty all become null. */
export const optionalText = (max: number) =>
  z
    .string({ error: messages.invalid })
    .trim()
    .max(max, messages.tooLong(max))
    .nullish()
    .transform((text) => text || null);

/** A required email address, trimmed. */
export const email = () => requiredText(254).pipe(z.email(messages.badEmail));

/** A choice made on a form: its stable id, and the label the visitor saw. */
export const choice = () =>
  z.object(
    {
      id: z.string({ error: messages.badChoice }).regex(/^[a-z0-9-]{1,40}$/, messages.badChoice),
      label: z
        .string({ error: messages.badChoice })
        .trim()
        .min(1, messages.badChoice)
        .max(120, messages.badChoice),
    },
    { error: (issue) => (issue.input == null ? messages.required : messages.badChoice) },
  );
