import type { SponsorRequest } from './schema';

/** How long a request is kept, in years (CNIL guidance for prospects). */
export const RETENTION_YEARS = 3;

/** Saves a validated request and returns its id. */
export async function insertSponsorRequest(
  db: D1Database,
  request: SponsorRequest,
  receivedAt: Date,
): Promise<number> {
  const row = await db
    .prepare(
      `INSERT INTO sponsor_requests (
        created_at, company, website, contact_name, role, email, phone,
        tier_id, tier_label, message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id`,
    )
    .bind(
      receivedAt.toISOString(),
      request.company,
      request.website,
      request.contactName,
      request.role,
      request.email,
      request.phone,
      request.tier.id,
      request.tier.label,
      request.message,
    )
    .first<{ id: number }>();
  if (!row) throw new Error('The insert returned no row');
  return row.id;
}

/** Deletes the requests older than the retention period and returns how many were deleted. */
export async function deleteExpiredSponsorRequests(db: D1Database, now: Date): Promise<number> {
  const cutoff = new Date(now);
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - RETENTION_YEARS);

  const result = await db
    .prepare('DELETE FROM sponsor_requests WHERE created_at < ?')
    .bind(cutoff.toISOString())
    .run();
  return result.meta.changes;
}
