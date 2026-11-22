import { app } from './app';
import { deleteExpiredSponsorRequests } from './forms/sponsor/repository';

export default {
  fetch: app.fetch,

  /** Weekly cron: deletes the sponsor requests past their retention period. */
  async scheduled(controller, env) {
    const deleted = await deleteExpiredSponsorRequests(env.DB, new Date(controller.scheduledTime));
    console.log(`Deleted ${deleted} expired sponsor request(s)`);
  },
} satisfies ExportedHandler<Env>;
