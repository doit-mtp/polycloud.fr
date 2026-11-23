/**
 * The 2027 sponsoring offer shown on /sponsors. This is the only place prices live:
 * the form sends the chosen tier with the label built here, and the API stores it as is.
 */

/** A choice sent to the API: a stable id plus the label shown to the visitor. */
export type Choice = { id: string; label: string };

export interface TierOffer {
  id: 'soutien' | 'argent' | 'or' | 'platine';
  name: string;
  /** Fixed price, excluding VAT. */
  priceEur: number;
  /** Only for tiers with a limited number of places. */
  slots?: string;
  /** The tier whose benefits this one includes. */
  includes?: string;
  /** What this tier adds. */
  perks: string[];
}

export const tiers: TierOffer[] = [
  {
    id: 'soutien',
    name: 'Soutien',
    priceEur: 100,
    perks: ['Logo sur le site, les écrans et les replays', 'Post de remerciement commun'],
  },
  {
    id: 'argent',
    name: 'Argent',
    priceEur: 500,
    includes: 'Soutien',
    perks: [
      "Table dans l'espace sponsors",
      'Post dédié',
      'Distribution de vos goodies',
      "Badges pour toute l'équipe présente",
      "Bilan après l'événement",
    ],
  },
  {
    id: 'or',
    name: 'Or',
    priceEur: 900,
    includes: 'Argent',
    perks: ['Stand dans le hall principal', 'Présentation de 2 à 3 min juste avant un talk'],
  },
  {
    id: 'platine',
    name: 'Platine',
    priceEur: 2000,
    slots: '1 seule place',
    includes: 'Or',
    perks: [
      "Sponsor principal de l'édition",
      "Mot d'ouverture (3 min)",
      'Le plus grand stand',
      '2 posts dédiés',
    ],
  },
];

export const undecidedTier: Choice = { id: 'indecis', label: 'Je ne sais pas encore' };

const eur = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** "2 000 €" */
export const formatEur = (amount: number) => `${eur.format(amount)} €`;

/** "Or · 900 € HT", or "Platine · 2 000 € HT · 1 seule place" */
export const tierChoice = (t: TierOffer): Choice => ({
  id: t.id,
  label: [t.name, `${formatEur(t.priceEur)} HT`, t.slots].filter(Boolean).join(' · '),
});
