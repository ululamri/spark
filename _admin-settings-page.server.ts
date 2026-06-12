import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const response = await adminApi.system(fetch);
    return { system: response.data, apiError: null };
  } catch (error) {
    return { system: null, apiError: adminErrorMessage(error) };
  }
};
