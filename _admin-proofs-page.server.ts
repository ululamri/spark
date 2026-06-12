import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const response = await adminApi.proofLedger(fetch);
    return { proofLedger: response.data, apiError: null };
  } catch (error) {
    return { proofLedger: null, apiError: adminErrorMessage(error) };
  }
};
