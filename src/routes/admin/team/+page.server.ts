import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminErrorMessage } from '$lib/admin/admin-api';
import { adminTeamApi } from '$lib/admin/admin-team-api';
import { guardAdminRoute } from '$lib/server/admin-access';

function textFromForm(formData: FormData, key: string) {
  const value = String(formData.get(key) || '').trim();
  return value.length ? value : undefined;
}

function pick(searchParams: URLSearchParams, key: string, allowed: string[], fallback = 'active') {
  const value = searchParams.get(key)?.trim() || fallback;
  return allowed.includes(value) ? value : fallback;
}

export const load: PageServerLoad = async (event) => {
  const { fetch, url } = event;
  const access = await guardAdminRoute(event);
  if (!access.requestContext) return fail(401, { error: 'Admin access is required.' });

  const filters = {
    role: pick(url.searchParams, 'role', ['all', 'admin', 'moderator'], 'all'),
    status: pick(url.searchParams, 'status', ['active', 'revoked', 'expired'], 'active')
  };

  const [membersResult, capabilitiesResult] = await Promise.allSettled([
    adminTeamApi.members(fetch, { limit: 50, role: filters.role, status: filters.status }, access.requestContext),
    adminTeamApi.capabilities(fetch, access.requestContext)
  ]);

  return {
    filters,
    members: membersResult.status === 'fulfilled' ? membersResult.value.data : null,
    roles: capabilitiesResult.status === 'fulfilled' ? capabilitiesResult.value.data : [],
    apiError: [membersResult, capabilitiesResult]
      .filter((result) => result.status === 'rejected')
      .map((result) => adminErrorMessage((result as PromiseRejectedResult).reason))
      .at(0) ?? null
  };
};

export const actions: Actions = {
  upsertMember: async (event) => {
    const { request, fetch } = event;
    const access = await guardAdminRoute(event);
    if (!access.requestContext) return fail(401, { error: 'Admin access is required.' });

    const formData = await request.formData();
    const role = textFromForm(formData, 'role');
    const email = textFromForm(formData, 'email');
    const userId = textFromForm(formData, 'user_id');
    if (!role || (!email && !userId)) return fail(400, { error: 'Role and target email/user ID are required.' });

    try {
      const response = await adminTeamApi.upsertMember(
        fetch,
        {
          email,
          user_id: userId,
          role,
          capabilities: [],
          reason: textFromForm(formData, 'reason'),
          expires_at: textFromForm(formData, 'expires_at') ?? null
        },
        access.requestContext
      );
      return { success: `${response.data.assignment.display_name} is now ${response.data.assignment.role}.` };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  },

  revokeMember: async (event) => {
    const { request, fetch } = event;
    const access = await guardAdminRoute(event);
    if (!access.requestContext) return fail(401, { error: 'Admin access is required.' });

    const formData = await request.formData();
    const role = textFromForm(formData, 'role');
    const userId = textFromForm(formData, 'user_id');
    if (!role || !userId) return fail(400, { error: 'Role and user ID are required.' });

    try {
      await adminTeamApi.revokeMember(
        fetch,
        userId,
        {
          role,
          reason: textFromForm(formData, 'reason')
        },
        access.requestContext
      );
      return { success: 'Delegated admin role was revoked.' };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  }
};
