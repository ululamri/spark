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
  target_role: 'admin' | 'moderator' | string | null;
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

export type AdminRecoveryArtifact = {
  id: string;
  reset_request_id: string;
  email: string;
  request_type: 'password' | 'email' | 'totp' | string;
  target_role: 'admin' | 'moderator' | string | null;
  status: 'pending' | 'used' | 'revoked' | 'expired' | string;
  created_by_actor_kind: string;
  created_by_user_id: string | null;
  issued_at: string;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
  metadata: Record<string, unknown>;
};

export type AdminRecoveryArtifactIssueResult = {
  artifact: AdminRecoveryArtifact;
  delivery_mode: 'manual_bootstrap' | 'out_of_band_delivery_pending' | string;
  manual_token: string | null;
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
    requestAdminJson<AdminResetReviewResult>(fetcher, '/reset/requests/' + encodeURIComponent(requestId) + '/review', input, context),
  issueRecoveryArtifact: (fetcher: typeof fetch, requestId: string, input: { reason?: string }, context?: AdminRequestContext) =>
    requestAdminJson<AdminRecoveryArtifactIssueResult>(fetcher, '/reset/requests/' + encodeURIComponent(requestId) + '/recovery-artifacts', input, context)
} as const;
