import { Hono } from 'hono';

import type { AppEnv } from '../types';
import { sponsorForm } from './sponsor/route';

/**
 * Every form of the site, one route each under `/forms`.
 * To add one: create a folder next to `sponsor/` and mount its router here.
 */
export const forms = new Hono<AppEnv>();

forms.route('/sponsor', sponsorForm);
