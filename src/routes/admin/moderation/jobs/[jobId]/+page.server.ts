import type { PageServerLoad } from './$types';
import { adminErrorMessage } from '$lib/admin/admin-api';
import { adminSocialOpsApi } from '$lib/admin/admin-social-ops-api';
import { requireAdminAccess } from '$lib/server/admin-access';

export const load: PageServerLoad = async (event) => {
  const { fetch, params } = event;
  const context = await requireAdminAccess(event, 'moderation_read');
  try {
    const response = await adminSocialOpsApi.bulkJobDetail(fetch, params.jobId, context);
    return {
      jobDetail: response.data,
      apiError: null
    };
  } catch (error) {
    return {
      jobDetail: null,
      apiError: adminErrorMessage(error)
    };
  }
};
