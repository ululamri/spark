import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminErrorMessage } from '$lib/admin/admin-api';
import { adminResetApi } from '$lib/admin/admin-reset-api';
import { guardAdminRoute } from '$lib/server/admin-access';

function textFromForm(formData: FormData, key: string) {
  const value = String(formData.get(key) || '').trim();
  return value.length ? value : undefined;
}

function pick(searchParams: URLSearchParams, key: string, allowed: string[], fallback = 'pending') {
  const value = searchParams.get(key)?.trim() || fallback;
  return allowed.includes(value) ? value : fallback;
}

export const load: PageServerLoad = async (event) => {
  const { fetch, url } = event;
  const access = await guardAdminRoute(event);
  if (!access.requestContext || !access.actor) return fail(401, { error: 'Admin access is required.' });
  if (!access.actor.capabilities.includes('admin_manage')) return fail(403, { error: 'Admin manage capability is required.' });

  const filters = {
    status: pick(url.searchParams, 'status', ['pending', 'approved', 'rejected', 'completed', 'expired', 'all'], 'pending'),
    requestType: pick(url.searchParams, 'request_type', ['all', 'password', 'email', 'totp'], 'all')
  };

  const requestsResult = await Promise.allSettled([
    adminResetApi.requests(fetch, { status: filters.status, request_type: filters.requestType, limit: 50 }, access.requestContext)
  ]);

  const resetRequests = requestsResult[0];
  return {
    filters,
    requests: resetRequests.status === 'fulfilled' ? resetRequests.value.data : null,
    apiError: resetRequests.status === 'rejected' ? adminErrorMessage(resetRequests.reason) : null
  };
};

export const actions: Actions = {
  reviewRequest: async (event) => {
    const { request, fetch } = event;
    const access = await guardAdminRoute(event);
    if (!access.requestContext || !access.actor) return fail(401, { error: 'Admin access is required.' });
    if (!access.actor.capabilities.includes('admin_manage')) return fail(403, { error: 'Admin manage capability is required.' });

    const formData = await request.formData();
    const requestId = textFromForm(formData, 'request_id');
    const decision = textFromForm(formData, 'decision');
    if (!requestId || (decision !== 'approved' && decision !== 'rejected')) {
      return fail(400, { error: 'Reset request ID and valid decision are required.' });
    }

    try {
      const response = await adminResetApi.reviewRequest(
        fetch,
        requestId,
        {
          decision,
          reason: textFromForm(formData, 'reason')
        },
        access.requestContext
      );
      return { success: `Reset request ${response.data.request.status}: ${response.data.request.email}.` };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  }
};
