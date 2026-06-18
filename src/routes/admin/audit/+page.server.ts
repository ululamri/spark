import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminErrorMessage } from '$lib/admin/admin-api';
import { adminAuditApi } from '$lib/admin/admin-audit-api';
import { guardAdminRoute } from '$lib/server/admin-access';

function pick(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key)?.trim() || 'all';
  if (value.length > 80 || /[\u0000-\u001f]/.test(value)) return 'all';
  return value;
}

export const load: PageServerLoad = async (event) => {
  const { fetch, url } = event;
  const access = await guardAdminRoute(event);
  if (!access.requestContext) throw error(401, 'Admin access is required.');

  const filters = {
    actorKind: pick(url.searchParams, 'actor_kind'),
    action: pick(url.searchParams, 'action'),
    targetType: pick(url.searchParams, 'target_type')
  };

  try {
    const response = await adminAuditApi.events(
      fetch,
      {
        limit: 75,
        actor_kind: filters.actorKind,
        action: filters.action,
        target_type: filters.targetType
      },
      access.requestContext
    );
    return {
      filters,
      events: response.data,
      apiError: null
    };
  } catch (errorValue) {
    return {
      filters,
      events: null,
      apiError: adminErrorMessage(errorValue)
    };
  }
};
