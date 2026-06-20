import {
  requestAdmin,
  requestAdminJson,
  type AdminRequestContext,
  type AdminSuccessEnvelope
} from '$lib/admin/admin-api';

export type AdminTeamMember = {
  id: string;
  user_id: string;
  email: string;
  display_name: string;
  handle: string | null;
  role: 'admin' | 'moderator' | string;
  capabilities: string[];
  status: string;
  reason: string;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminTeamMembers = {
  items: AdminTeamMember[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminRoleInfo = {
  role: string;
  description: string;
  capabilities: string[];
};

export type AdminActor = {
  actor_kind: string;
  actor_user_id: string | null;
  role: 'superadmin' | 'admin' | 'moderator' | string;
  capabilities: string[];
};

export type AdminTeamWriteResult = {
  assignment: AdminTeamMember;
};

export type AdminInvitation = {
  id: string;
  email: string;
  role: 'admin' | 'moderator' | string;
  capabilities: string[];
  invited_by_actor_kind: string;
  invited_by_user_id: string | null;
  expires_at: string;
  accepted_at: string | null;
  accepted_by_user_id: string | null;
  revoked_at: string | null;
  created_at: string;
  metadata: Record<string, unknown>;
  status: 'pending' | 'accepted' | 'revoked' | 'expired' | string;
};

export type AdminInvitations = {
  items: AdminInvitation[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminInvitationCreateResult = {
  invitation: AdminInvitation;
  delivery_mode: string;
  manual_token: string | null;
};

export type AdminInvitationRevokeResult = {
  invitation: AdminInvitation;
};

function membersQuery(input: { limit?: number; offset?: number; role?: string; status?: string } = {}) {
  const query = new URLSearchParams({ limit: String(input.limit ?? 50), offset: String(input.offset ?? 0) });
  if (input.role && input.role !== 'all') query.set('role', input.role);
  if (input.status && input.status !== 'all') query.set('status', input.status);
  return query;
}

function invitationsQuery(input: { limit?: number; offset?: number; role?: string; status?: string; email?: string } = {}) {
  const query = new URLSearchParams({ limit: String(input.limit ?? 50), offset: String(input.offset ?? 0) });
  if (input.role && input.role !== 'all') query.set('role', input.role);
  if (input.status && input.status !== 'all') query.set('status', input.status);
  if (input.email) query.set('email', input.email);
  return query;
}

export const adminTeamApi = {
  actor: (fetcher: typeof fetch, context?: AdminRequestContext): Promise<AdminSuccessEnvelope<AdminActor>> =>
    requestAdmin<AdminActor>(fetcher, '/team/actor', context),
  capabilities: (fetcher: typeof fetch, context?: AdminRequestContext) => requestAdmin<AdminRoleInfo[]>(fetcher, '/team/capabilities', context),
  members: (fetcher: typeof fetch, input: { limit?: number; offset?: number; role?: string; status?: string } = {}, context?: AdminRequestContext) =>
    requestAdmin<AdminTeamMembers>(fetcher, '/team/members?' + membersQuery(input), context),
  invitations: (fetcher: typeof fetch, input: { limit?: number; offset?: number; role?: string; status?: string; email?: string } = {}, context?: AdminRequestContext) =>
    requestAdmin<AdminInvitations>(fetcher, '/team/invitations?' + invitationsQuery(input), context),
  createInvitation: (
    fetcher: typeof fetch,
    input: { email: string; role: string; capabilities?: string[]; reason?: string; expires_at?: string | null },
    context?: AdminRequestContext
  ) => requestAdminJson<AdminInvitationCreateResult>(fetcher, '/team/invitations', input, context),
  revokeInvitation: (fetcher: typeof fetch, invitationId: string, input: { reason?: string }, context?: AdminRequestContext) =>
    requestAdminJson<AdminInvitationRevokeResult>(fetcher, '/team/invitations/' + encodeURIComponent(invitationId) + '/revoke', input, context),
  revokeMember: (fetcher: typeof fetch, userId: string, input: { role: string; reason?: string }, context?: AdminRequestContext) =>
    requestAdminJson<AdminTeamWriteResult>(fetcher, '/team/members/' + encodeURIComponent(userId) + '/revoke', input, context)
} as const;
