import {
  requestAdmin,
  type AdminDataSource,
  type AdminRequestContext,
  type AdminSuccessEnvelope
} from '$lib/admin/admin-api';

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

function eventsQuery(input: { limit?: number; offset?: number; actor_kind?: string; action?: string; target_type?: string } = {}) {
  const query = new URLSearchParams({ limit: String(input.limit ?? 75), offset: String(input.offset ?? 0) });
  if (input.actor_kind && input.actor_kind !== 'all') query.set('actor_kind', input.actor_kind);
  if (input.action && input.action !== 'all') query.set('action', input.action);
  if (input.target_type && input.target_type !== 'all') query.set('target_type', input.target_type);
  return query;
}

export const adminAuditApi = {
  events: (
    fetcher: typeof fetch,
    input: { limit?: number; offset?: number; actor_kind?: string; action?: string; target_type?: string } = {},
    context?: AdminRequestContext
  ): Promise<AdminSuccessEnvelope<AdminAuditEvents>> => requestAdmin<AdminAuditEvents>(fetcher, '/audit/events?' + eventsQuery(input), context),
  eventDetail: (fetcher: typeof fetch, eventId: string, context?: AdminRequestContext): Promise<AdminSuccessEnvelope<AdminAuditEvent>> =>
    requestAdmin<AdminAuditEvent>(fetcher, '/audit/events/' + encodeURIComponent(eventId), context)
} as const;
