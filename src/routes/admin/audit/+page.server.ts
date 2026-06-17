import type { PageServerLoad } from './$types';
import { adminErrorMessage } from '$lib/admin/admin-api';
import { adminAuditApi } from '$lib/admin/admin-audit-api';

function pick(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key)?.trim() || 'all';
  if (value.length > 80 || /[\u0000-\u001f]/.test(value)) return 'all';
  return value;
}

export const load: PageServerLoad = async ({ fetch, url }) => {
  const filters = {
    actorKind: pick(url.searchParams, 'actor_kind'),
    action: pick(url.searchParams, 'action'),
    targetType: pick(url.searchParams, 'target_type')
  };

  try {
    const response = await adminAuditApi.events(fetch, {
      limit: 75,
      actor_kind: filters.actorKind,
      action: filters.action,
      target_type: filters.targetType
    });
    return {
      filters,
      events: response.data,
      apiError: null
    };
  } catch (error) {
    return {
      filters,
      events: null,
      apiError: adminErrorMessage(error)
    };
  }
};
