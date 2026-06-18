import { env as publicEnv } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';
import { getAdminAuthConfig } from '$lib/server/admin-auth';
import { guardAdminRoute } from '$lib/server/admin-access';

export const load: LayoutServerLoad = async (event) => {
  const config = getAdminAuthConfig();
  const access = await guardAdminRoute(event);

  return {
    adminConfigured: config.configured,
    adminAuthenticated: Boolean(access.actor),
    adminActor: access.actor,
    deploymentMode: publicEnv.PUBLIC_SPARK_MODE || 'production',
    publicApiBaseUrl: publicEnv.PUBLIC_SPARK_API_URL || '/api',
    appVersion: '0.1.0'
  };
};
