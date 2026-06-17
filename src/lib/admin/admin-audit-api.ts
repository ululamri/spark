import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';
import { AdminApiError, type AdminDataSource, type AdminErrorEnvelope, type AdminSuccessEnvelope } from '$lib/admin/admin-api';

export type AdminAuditEvent = {
  id: string;
  actor_kind: string;
  actor_user_id: string | null;
  action: string;
  target_type: string;
  target_user_id: string | null;
  target_id: string | null;
  capabilities: string[];
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AdminAuditEvents = {
  items: AdminAuditEvent[];
  limit: number;
  offset: number;
  total: number;
  data_source: AdminDataSource;
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

function eventsQuery(input: { limit?: number; offset?: number; actor_kind?: string; action?: string; target_type?: string } = {}) {
  const query = new URLSearchParams({ limit: String(input.limit ?? 75), offset: String(input.offset ?? 0) });
  if (input.actor_kind && input.actor_kind !== 'all') query.set('actor_kind', input.actor_kind);
  if (input.action && input.action !== 'all') query.set('action', input.action);
  if (input.target_type && input.target_type !== 'all') query.set('target_type', input.target_type);
  return query;
}

export const adminAuditApi = {
  events: (fetcher: typeof fetch, input: { limit?: number; offset?: number; actor_kind?: string; action?: string; target_type?: string } = {}) =>
    requestAdmin<AdminAuditEvents>(fetcher, '/audit/events?' + eventsQuery(input)),
  eventDetail: (fetcher: typeof fetch, eventId: string) =>
    requestAdmin<AdminAuditEvent>(fetcher, '/audit/events/' + encodeURIComponent(eventId))
} as const;
