import { z } from 'zod';

import { choice, email, optionalText, requiredText } from '../fields';

/** The JSON body posted by the sponsor form. */
export const sponsorRequestBody = z.object({
  company: requiredText(200),
  website: optionalText(300),
  contactName: requiredText(200),
  role: optionalText(200),
  email: email(),
  phone: optionalText(50),
  tier: choice(),
  message: optionalText(5000),
});

/** A validated sponsor request, as stored and emailed. */
export type SponsorRequest = z.output<typeof sponsorRequestBody>;
