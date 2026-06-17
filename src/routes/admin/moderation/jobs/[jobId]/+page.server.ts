import type { PageServerLoad } from './$types';
import { adminErrorMessage } from '$lib/admin/admin-api';
import { adminSocialOpsApi } from '$lib/admin/admin-social-ops-api';

export const load: PageServerLoad = async ({ fetch, params }) => {
  try {
    const response = await adminSocialOpsApi.bulkJobDetail(fetch, params.jobId);
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
