import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';
import { guardAdminRoute } from '$lib/server/admin-access';

export const load: PageServerLoad = async (event) => {
  const access = await guardAdminRoute(event);
  try {
    const response = await adminApi.passports(event.fetch, access.requestContext ?? undefined);
    return { passports: response.data, apiError: null };
  } catch (error) {
    return { passports: null, apiError: adminErrorMessage(error) };
  }
};
