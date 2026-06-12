import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const response = await adminApi.communityPilot(fetch);
    return { pilot: response.data, apiError: null };
  } catch (error) {
    return { pilot: null, apiError: adminErrorMessage(error) };
  }
};
