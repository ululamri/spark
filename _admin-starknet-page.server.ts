import { env as publicEnv } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';

export const load: PageServerLoad = async ({ fetch }) => {
  try {
    const response = await adminApi.starknet(fetch);
    return { starknet: response.data, hubUrl: publicEnv.PUBLIC_SPARK_HUB_URL || '/hub', apiError: null };
  } catch (error) {
    return { starknet: null, hubUrl: publicEnv.PUBLIC_SPARK_HUB_URL || '/hub', apiError: adminErrorMessage(error) };
  }
};
