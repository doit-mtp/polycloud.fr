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

/** A choice made on a form, sent as its id and turned into the matching option. Other ids are refused. */
export const choice = <T extends { id: string }>(options: readonly T[]) =>
  z
    .string({
      error: (issue) => (issue.input == null ? messages.required : messages.badChoice),
    })
    .transform((id, ctx) => {
      const option = options.find((o) => o.id === id);
      if (option) return option;
      ctx.addIssue({ code: 'custom', message: messages.badChoice });
      return z.NEVER;
    });
