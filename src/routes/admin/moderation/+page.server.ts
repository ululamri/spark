import type { Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import {
  loadModerationAdminSurface,
  markModerationSignalReviewed,
  runBulkModeration,
  runModerationScan
} from '$lib/server/admin-moderation-access';

export const load: PageServerLoad = async (event) => loadModerationAdminSurface(event);

export const actions: Actions = {
  scanTarget: (event) => runModerationScan(event),
  markSignalReviewed: (event) => markModerationSignalReviewed(event),
  bulkPosts: (event) => runBulkModeration(event, 'post'),
  bulkComments: (event) => runBulkModeration(event, 'comment'),
  bulkReports: (event) => runBulkModeration(event, 'report')
};
