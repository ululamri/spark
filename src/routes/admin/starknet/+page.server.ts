import { env as publicEnv } from '$env/dynamic/public';
import type { PageServerLoad } from './$types';
import { adminApi, adminErrorMessage } from '$lib/admin/admin-api';
import { guardAdminRoute } from '$lib/server/admin-access';

export const load: PageServerLoad = async (event) => {
  const access = await guardAdminRoute(event);
  try {
    const response = await adminApi.starknet(event.fetch, access.requestContext ?? undefined);
    return { starknet: response.data, hubUrl: publicEnv.PUBLIC_SPARK_HUB_URL || '/hub', apiError: null };
  } catch (error) {
    return { starknet: null, hubUrl: publicEnv.PUBLIC_SPARK_HUB_URL || '/hub', apiError: adminErrorMessage(error) };
  }
};
