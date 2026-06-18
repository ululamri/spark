import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';
import { guardAdminRoute } from '$lib/server/admin-access';

export const load: PageServerLoad = async (event) => {
  const access = await guardAdminRoute(event);
  try {
    const response = await adminApi.learner(event.fetch, event.params.id, access.requestContext ?? undefined);
    return { learner: response.data, apiError: null };
  } catch (error) {
    return { learner: null, apiError: adminErrorMessage(error) };
  }
};
