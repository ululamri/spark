import {
  requestAdmin,
  type AdminDataSource,
  type AdminList,
  type AdminRequestContext
} from '$lib/admin/admin-api';

export type AdminSocialBulkJobRow = {
  id: string;
  actor_kind: string;
  actor_user_id: string | null;
  target_type: string;
  action: string;
  reason: string;
  status: string;
  dry_run: boolean;
  idempotency_key: string | null;
  total_count: number;
  would_apply_count: number;
  applied_count: number;
  skipped_count: number;
  failed_count: number;
  payload: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
};

export type AdminSocialBulkJobItem = {
  id: string;
  bulk_job_id: string;
  target_type: string;
  target_id: string;
  action: string;
  status: string;
  action_id: string | null;
  report_id: string | null;
  message: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type AdminSocialBulkJobDetail = {
  job: AdminSocialBulkJobRow;
  items: AdminSocialBulkJobItem[];
  data_source: AdminDataSource;
};

function listQuery(input: { limit?: number; offset?: number; status?: string; target_type?: string } = {}) {
  const query = new URLSearchParams({ limit: String(input.limit ?? 25), offset: String(input.offset ?? 0) });
  if (input.status) query.set('status', input.status);
  if (input.target_type) query.set('target_type', input.target_type);
  return query;
}

export const adminSocialOpsApi = {
  bulkJobs: (fetcher: typeof fetch, input: { limit?: number; offset?: number; status?: string; target_type?: string } = {}, context?: AdminRequestContext) =>
    requestAdmin<AdminList<AdminSocialBulkJobRow>>(fetcher, '/social/ops/bulk-jobs?' + listQuery(input), context),
  bulkJobDetail: (fetcher: typeof fetch, jobId: string, context?: AdminRequestContext) =>
    requestAdmin<AdminSocialBulkJobDetail>(fetcher, '/social/ops/bulk-jobs/' + encodeURIComponent(jobId), context)
} as const;
