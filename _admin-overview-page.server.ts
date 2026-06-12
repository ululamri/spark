import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const response = await adminApi.overview(fetch);
    return { overview: response.data, generatedAt: response.generated_at, apiError: null };
  } catch (error) {
    return { overview: null, generatedAt: null, apiError: adminErrorMessage(error) };
  }
};
