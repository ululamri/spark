import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const response = await adminApi.learners(fetch);
    return { learners: response.data, apiError: null };
  } catch (error) {
    return { learners: null, apiError: adminErrorMessage(error) };
  }
};
