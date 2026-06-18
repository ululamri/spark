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

function membersQuery(input: { limit?: number; offset?: number; role?: string; status?: string } = {}) {
  const query = new URLSearchParams({ limit: String(input.limit ?? 50), offset: String(input.offset ?? 0) });
  if (input.role && input.role !== 'all') query.set('role', input.role);
  if (input.status && input.status !== 'all') query.set('status', input.status);
  return query;
}

export const adminTeamApi = {
  actor: (fetcher: typeof fetch, context?: AdminRequestContext): Promise<AdminSuccessEnvelope<AdminActor>> =>
    requestAdmin<AdminActor>(fetcher, '/team/actor', context),
  capabilities: (fetcher: typeof fetch, context?: AdminRequestContext) => requestAdmin<AdminRoleInfo[]>(fetcher, '/team/capabilities', context),
  members: (fetcher: typeof fetch, input: { limit?: number; offset?: number; role?: string; status?: string } = {}, context?: AdminRequestContext) =>
    requestAdmin<AdminTeamMembers>(fetcher, '/team/members?' + membersQuery(input), context),
  upsertMember: (
    fetcher: typeof fetch,
    input: { email?: string; user_id?: string; role: string; capabilities?: string[]; reason?: string; expires_at?: string | null },
    context?: AdminRequestContext
  ) => requestAdminJson<AdminTeamWriteResult>(fetcher, '/team/members', input, context),
  revokeMember: (fetcher: typeof fetch, userId: string, input: { role: string; reason?: string }, context?: AdminRequestContext) =>
    requestAdminJson<AdminTeamWriteResult>(fetcher, '/team/members/' + encodeURIComponent(userId) + '/revoke', input, context)
} as const;
