import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { AdminApiError, type AdminErrorEnvelope, type AdminSuccessEnvelope } from '$lib/admin/admin-api';

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

export type AdminTeamWriteResult = {
  assignment: AdminTeamMember;
};

function trimSlash(value: string) {
  return value.replace(/\/+$/, '');
}

function adminBaseUrl() {
  const configured =
    privateEnv.KARYRA_ADMIN_API_BASE_URL?.trim() ||
    privateEnv.API_BASE_URL?.trim() ||
    publicEnv.PUBLIC_SPARK_API_URL?.trim() ||
    publicEnv.PUBLIC_SPARK_API_BASE?.trim() ||
    publicEnv.PUBLIC_API_BASE?.trim() ||
    '/api';
  const base = trimSlash(configured);
  if (base.endsWith('/api/admin')) return base;
  if (base.endsWith('/api')) return base + '/admin';
  return base + '/api/admin';
}

function adminToken() {
  const token = privateEnv.KARYRA_ADMIN_TOKEN?.trim();
  if (!token) throw new AdminApiError(503, 'admin_token_missing', 'The private admin API token is not configured.');
  return token;
}

async function parseAdminResponse<T>(response: Response): Promise<AdminSuccessEnvelope<T>> {
  const body = (await response.json().catch(() => null)) as AdminSuccessEnvelope<T> | AdminErrorEnvelope | null;
  if (!response.ok || !body || !body.ok) {
    const error = body && !body.ok ? body.error : null;
    throw new AdminApiError(response.status, error?.code || 'admin_api_error', error?.message || `Admin API request failed (${response.status}).`);
  }
  return body;
}

async function requestAdmin<T>(fetcher: typeof fetch, path: string): Promise<AdminSuccessEnvelope<T>> {
  const response = await fetcher(adminBaseUrl() + path, {
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'x-karyra-admin-token': adminToken()
    },
    signal: AbortSignal.timeout(8000)
  });
  return parseAdminResponse<T>(response);
}

async function requestAdminJson<T>(fetcher: typeof fetch, path: string, payload: unknown): Promise<AdminSuccessEnvelope<T>> {
  const response = await fetcher(adminBaseUrl() + path, {
    method: 'POST',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
      'x-karyra-admin-token': adminToken()
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(12000)
  });
  return parseAdminResponse<T>(response);
}

function membersQuery(input: { limit?: number; offset?: number; role?: string; status?: string } = {}) {
  const query = new URLSearchParams({ limit: String(input.limit ?? 50), offset: String(input.offset ?? 0) });
  if (input.role && input.role !== 'all') query.set('role', input.role);
  if (input.status && input.status !== 'all') query.set('status', input.status);
  return query;
}

export const adminTeamApi = {
  capabilities: (fetcher: typeof fetch) => requestAdmin<AdminRoleInfo[]>(fetcher, '/team/capabilities'),
  members: (fetcher: typeof fetch, input: { limit?: number; offset?: number; role?: string; status?: string } = {}) =>
    requestAdmin<AdminTeamMembers>(fetcher, '/team/members?' + membersQuery(input)),
  upsertMember: (
    fetcher: typeof fetch,
    input: { email?: string; user_id?: string; role: string; capabilities?: string[]; reason?: string; expires_at?: string | null }
  ) => requestAdminJson<AdminTeamWriteResult>(fetcher, '/team/members', input),
  revokeMember: (fetcher: typeof fetch, userId: string, input: { role: string; reason?: string }) =>
    requestAdminJson<AdminTeamWriteResult>(fetcher, '/team/members/' + encodeURIComponent(userId) + '/revoke', input)
} as const;
