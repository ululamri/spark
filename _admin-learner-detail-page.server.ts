import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';

export const load: PageServerLoad = async ({ fetch, params }) => {
  try {
    const response = await adminApi.learner(fetch, params.id);
    return { learner: response.data, apiError: null };
  } catch (error) {
    return { learner: null, apiError: adminErrorMessage(error) };
  }
};
