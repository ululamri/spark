import type { PageServerLoad } from './$types';
import { adminErrorMessage } from '$lib/admin/admin-api';
import { adminAuditApi } from '$lib/admin/admin-audit-api';

export const load: PageServerLoad = async ({ fetch, params }) => {
  try {
    const response = await adminAuditApi.eventDetail(fetch, params.eventId);
    return {
      event: response.data,
      apiError: null
    };
  } catch (error) {
    return {
      event: null,
      apiError: adminErrorMessage(error)
    };
  }
};
