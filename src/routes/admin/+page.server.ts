import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';
import { guardAdminRoute } from '$lib/server/admin-access';

export const load: PageServerLoad = async (event) => {
  const access = await guardAdminRoute(event);
  try {
    const response = await adminApi.overview(event.fetch, access.requestContext ?? undefined);
    return { overview: response.data, generatedAt: response.generated_at, apiError: null };
  } catch (error) {
    return { overview: null, generatedAt: null, apiError: adminErrorMessage(error) };
  }
};
