import { redirect } from '@sveltejs/kit';
import { env as publicEnv } from '$env/dynamic/public';
import type { LayoutServerLoad } from './$types';
import { getAdminAuthConfig, hasValidAdminSession } from '$lib/server/admin-auth';

const SUPERADMIN_CAPABILITIES = [
  'developer_access',
  'admin_manage',
  'policy_manage',
  'ai_manage',
  'ml_moderation_manage',
  'moderation_read',
  'moderation_action',
  'moderation_restore',
  'moderation_bulk',
  'user_safety_manage',
  'reports_manage',
  'content_read',
  'content_create',
  'content_edit',
  'content_publish',
  'content_archive',
  'media_review',
  'audit_read'
];

export const load: LayoutServerLoad = async ({ cookies, url }) => {
  const config = getAdminAuthConfig();
  const authenticated = hasValidAdminSession(cookies);
  const isLoginRoute = url.pathname === '/admin/login';

  if (isLoginRoute && authenticated) redirect(303, '/admin');
  if (!isLoginRoute && !authenticated) redirect(303, '/admin/login');

  return {
    adminConfigured: config.configured,
    adminAuthenticated: authenticated,
    adminActor: authenticated
      ? {
          mode: 'superadmin' as const,
          role: 'superadmin',
          actorKind: 'super_admin_session',
          capabilities: SUPERADMIN_CAPABILITIES
        }
      : null,
    deploymentMode: publicEnv.PUBLIC_SPARK_MODE || 'production',
    publicApiBaseUrl: publicEnv.PUBLIC_SPARK_API_URL || '/api',
    appVersion: '0.1.0'
  };
};
