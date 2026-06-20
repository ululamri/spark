import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { adminErrorMessage } from '$lib/admin/admin-api';
import { adminTeamApi } from '$lib/admin/admin-team-api';
import { guardAdminRoute } from '$lib/server/admin-access';

function textFromForm(formData: FormData, key: string) {
  const value = String(formData.get(key) || '').trim();
  return value.length ? value : undefined;
}

function listFromForm(formData: FormData, key: string) {
  return formData
    .getAll(key)
    .map((value) => String(value).trim())
    .filter(Boolean);
}

function pick(searchParams: URLSearchParams, key: string, allowed: string[], fallback = 'active') {
  const value = searchParams.get(key)?.trim() || fallback;
  return allowed.includes(value) ? value : fallback;
}

export const load: PageServerLoad = async (event) => {
  const { fetch, url } = event;
  const access = await guardAdminRoute(event);
  if (!access.requestContext || !access.actor) return fail(401, { error: 'Admin access is required.' });

  const filters = {
    role: pick(url.searchParams, 'role', ['all', 'admin', 'moderator'], 'all'),
    status: pick(url.searchParams, 'status', ['active', 'revoked', 'expired'], 'active'),
    invitationStatus: pick(url.searchParams, 'invitation_status', ['pending', 'accepted', 'revoked', 'expired', 'all'], 'pending')
  };

  const [membersResult, capabilitiesResult, invitationsResult] = await Promise.allSettled([
    adminTeamApi.members(fetch, { limit: 50, role: filters.role, status: filters.status }, access.requestContext),
    adminTeamApi.capabilities(fetch, access.requestContext),
    adminTeamApi.invitations(fetch, { limit: 50, role: filters.role, status: filters.invitationStatus }, access.requestContext)
  ]);

  return {
    filters,
    canInviteTeam: access.actor.role === 'superadmin' || access.actor.role === 'admin',
    canInviteAdmin: access.actor.role === 'superadmin',
    canRevokeMember: access.actor.capabilities.includes('admin_manage'),
    members: membersResult.status === 'fulfilled' ? membersResult.value.data : null,
    invitations: invitationsResult.status === 'fulfilled' ? invitationsResult.value.data : null,
    roles: capabilitiesResult.status === 'fulfilled' ? capabilitiesResult.value.data : [],
    apiError: [membersResult, capabilitiesResult, invitationsResult]
      .filter((result) => result.status === 'rejected')
      .map((result) => adminErrorMessage((result as PromiseRejectedResult).reason))
      .at(0) ?? null
  };
};

export const actions: Actions = {
  createInvitation: async (event) => {
    const { request, fetch } = event;
    const access = await guardAdminRoute(event);
    if (!access.requestContext || !access.actor) return fail(401, { error: 'Admin access is required.' });
    if (access.actor.role !== 'superadmin' && access.actor.role !== 'admin') return fail(403, { error: 'This admin role cannot create invitations.' });

    const formData = await request.formData();
    const email = textFromForm(formData, 'email');
    const role = textFromForm(formData, 'role');
    if (!email || !role) return fail(400, { error: 'Email and role are required.' });
    if (role === 'admin' && access.actor.role !== 'superadmin') return fail(403, { error: 'Only superadmin can invite admin.' });

    try {
      const response = await adminTeamApi.createInvitation(
        fetch,
        {
          email,
          role,
          capabilities: listFromForm(formData, 'capabilities'),
          reason: textFromForm(formData, 'reason'),
          expires_at: textFromForm(formData, 'expires_at') ?? null
        },
        access.requestContext
      );
      return {
        success: `Invitation created for ${response.data.invitation.email} as ${response.data.invitation.role}.`,
        invitation: response.data
      };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  },

  revokeInvitation: async (event) => {
    const { request, fetch } = event;
    const access = await guardAdminRoute(event);
    if (!access.requestContext || !access.actor) return fail(401, { error: 'Admin access is required.' });
    if (access.actor.role !== 'superadmin' && access.actor.role !== 'admin') return fail(403, { error: 'This admin role cannot revoke invitations.' });

    const formData = await request.formData();
    const invitationId = textFromForm(formData, 'invitation_id');
    if (!invitationId) return fail(400, { error: 'Invitation ID is required.' });

    try {
      await adminTeamApi.revokeInvitation(fetch, invitationId, { reason: textFromForm(formData, 'reason') }, access.requestContext);
      return { success: 'Invitation was revoked.' };
    } catch (error) {
      return fail(400, { error: adminErrorMessage(error) });
    }
  },

  revokeMember: async (event) => {
    const { request, fetch } = event;
    const access = await guardAdminRoute(event);
    if (!access.requestContext || !access.actor) return fail(401, { error: 'Admin access is required.' });
    if (!access.actor.capabilities.includes('admin_manage')) return fail(403, { error: 'This admin role cannot revoke delegated roles.' });

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
