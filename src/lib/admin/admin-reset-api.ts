import { requestAdmin, requestAdminJson, type AdminRequestContext } from '$lib/admin/admin-api';

export type AdminResetRequest = {
  id: string;
  email: string;
  request_type: 'password' | 'email' | 'totp' | string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'expired' | string;
  requested_at: string;
  reviewed_by_actor_kind: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  expires_at: string;
  metadata: Record<string, unknown>;
};

export type AdminResetRequests = {
  items: AdminResetRequest[];
  total: number;
  limit: number;
  offset: number;
};

export type AdminResetReviewResult = {
  request: AdminResetRequest;
};

function resetQuery(input: { status?: string; request_type?: string; limit?: number; offset?: number } = {}) {
  const query = new URLSearchParams({ limit: String(input.limit ?? 50), offset: String(input.offset ?? 0) });
  if (input.status && input.status !== 'all') query.set('status', input.status);
  if (input.request_type && input.request_type !== 'all') query.set('request_type', input.request_type);
  return query;
}

export const adminResetApi = {
  requests: (fetcher: typeof fetch, input: { status?: string; request_type?: string; limit?: number; offset?: number } = {}, context?: AdminRequestContext) =>
    requestAdmin<AdminResetRequests>(fetcher, '/reset/requests?' + resetQuery(input), context),
  reviewRequest: (fetcher: typeof fetch, requestId: string, input: { decision: 'approved' | 'rejected'; reason?: string }, context?: AdminRequestContext) =>
    requestAdminJson<AdminResetReviewResult>(fetcher, '/reset/requests/' + encodeURIComponent(requestId) + '/review', input, context)
} as const;
