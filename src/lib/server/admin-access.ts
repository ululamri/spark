import { error, redirect } from '@sveltejs/kit';
import { adminTeamApi, type AdminActor } from '$lib/admin/admin-team-api';
import type { AdminRequestContext } from '$lib/admin/admin-api';
import { hasValidAdminSession } from '$lib/server/admin-auth';

export type AdminUiActor = {
  mode: 'superadmin' | 'delegated';
  role: 'superadmin' | 'admin' | 'moderator' | string;
  actorKind: string;
  actorUserId: string | null;
  capabilities: string[];
};

export type AdminAccess = {
  actor: AdminUiActor | null;
  requestContext: AdminRequestContext | null;
};

type AdminAccessEvent = {
  cookies: { get(name: string): string | undefined };
  request: Request;
  fetch: typeof fetch;
};

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

const ENABLE_DELEGATED_ADMIN_ROUTES = true;
const ADMIN_AUTH_SURFACE_PATHS = new Set(['/admin/login', '/admin/superadmin/login', '/admin/onboarding', '/admin/reset']);

function normalizeActor(actor: AdminActor): AdminUiActor {
  return {
    mode: actor.role === 'superadmin' ? 'superadmin' : 'delegated',
    role: actor.role,
    actorKind: actor.actor_kind,
    actorUserId: actor.actor_user_id,
    capabilities: actor.capabilities
  };
}

function superadminActor(): AdminUiActor {
  return {
    mode: 'superadmin',
    role: 'superadmin',
    actorKind: 'super_admin_session',
    actorUserId: null,
    capabilities: SUPERADMIN_CAPABILITIES
  };
}

function hasCapability(actor: AdminUiActor, capability: string) {
  return actor.capabilities.includes(capability);
}

export async function resolveAdminAccess(event: AdminAccessEvent): Promise<AdminAccess> {
  if (hasValidAdminSession(event.cookies)) return { actor: superadminActor(), requestContext: { mode: 'superadmin' } };

  const cookieHeader = event.request.headers.get('cookie');
  if (!cookieHeader) return { actor: null, requestContext: null };

  try {
    const response = await adminTeamApi.actor(event.fetch, { mode: 'delegated', cookieHeader });
    const actor = normalizeActor(response.data);
    if (actor.role !== 'admin' && actor.role !== 'moderator') return { actor: null, requestContext: null };
    return { actor, requestContext: { mode: 'delegated', cookieHeader } };
  } catch {
    return { actor: null, requestContext: null };
  }
}

export function defaultAdminPath(actor: AdminUiActor | null) {
  if (!actor) return '/admin/login';
  if (actor.role === 'superadmin') return '/admin';
  if (hasCapability(actor, 'moderation_read')) return '/admin/moderation';
  if (hasCapability(actor, 'audit_read')) return '/admin/audit';
  if (hasCapability(actor, 'content_read')) return '/admin/content';
  return '/admin/settings';
}

export function canAccessAdminPath(actor: AdminUiActor | null, pathname: string) {
  if (!actor) return ADMIN_AUTH_SURFACE_PATHS.has(pathname);
  if (ADMIN_AUTH_SURFACE_PATHS.has(pathname) || pathname === '/admin/logout') return true;
  if (actor.role === 'superadmin') return pathname.startsWith('/admin');
  if (!ENABLE_DELEGATED_ADMIN_ROUTES) return false;

  if (pathname === '/admin/settings') return true;
  if (pathname === '/admin/moderation' || pathname.startsWith('/admin/moderation/')) return hasCapability(actor, 'moderation_read');
  if (pathname === '/admin/audit' || pathname.startsWith('/admin/audit/')) return hasCapability(actor, 'audit_read');
  if (pathname === '/admin/team' || pathname.startsWith('/admin/team/')) return hasCapability(actor, 'audit_read');
  if (pathname === '/admin/reset/requests' || pathname.startsWith('/admin/reset/requests/')) return hasCapability(actor, 'admin_manage');
  if (pathname === '/admin/content' || pathname.startsWith('/admin/content/')) return hasCapability(actor, 'content_read');

  return false;
}

export function requireCapability(access: AdminAccess, capability: string) {
  if (!access.actor || !access.requestContext) throw error(401, 'Admin access is required.');
  if (!access.actor.capabilities.includes(capability)) throw error(403, 'This admin role cannot access this action.');
  return access.requestContext;
}

export async function requireAdminAccess(event: AdminAccessEvent, capability: string) {
  const access = await resolveAdminAccess(event);
  return requireCapability(access, capability);
}

export async function guardAdminRoute(event: AdminAccessEvent & { url: URL }) {
  const access = await resolveAdminAccess(event);
  const pathname = event.url.pathname;

  if (ADMIN_AUTH_SURFACE_PATHS.has(pathname) && access.actor) redirect(303, defaultAdminPath(access.actor));

  if (!canAccessAdminPath(access.actor, pathname)) {
    if (!access.actor) redirect(303, '/admin/login');
    redirect(303, defaultAdminPath(access.actor));
  }

  return access;
}
