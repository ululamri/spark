import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const response = await adminApi.passports(fetch);
    return { passports: response.data, apiError: null };
  } catch (error) {
    return { passports: null, apiError: adminErrorMessage(error) };
  }
};
