import type { PageServerLoad } from './$types';
import { adminErrorMessage } from '$lib/admin/admin-api';
import { adminAuditApi } from '$lib/admin/admin-audit-api';
import { guardAdminRoute } from '$lib/server/admin-access';

export const load: PageServerLoad = async (event) => {
  const access = await guardAdminRoute(event);
  try {
    const response = await adminAuditApi.eventDetail(event.fetch, event.params.eventId, access.requestContext ?? undefined);
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
