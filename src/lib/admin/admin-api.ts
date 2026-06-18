import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

export type AdminRequestMode = 'superadmin' | 'delegated';

export type AdminRequestContext = {
  mode?: AdminRequestMode;
  cookieHeader?: string | null;
};

export type AdminDataSource = 'database' | 'progress_records' | 'community_workshop_registrations' | 'not_available' | string;

export type AdminSuccessEnvelope<T> = {
  ok: true;
  data: T;
  generated_at: string;
};

export type AdminErrorEnvelope = {
  ok: false;
  error: { code: string; message: string };
};

export class AdminApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

export type AdminActivity = {
  id: string;
  learner_id: string;
  activity_type: string;
  activity_title: string;
  source: string | null;
  status: string;
  timestamp: string;
};

export type AdminOverview = {
  total_learners: number;
  total_lessons: number;
  total_lesson_completions: number;
  total_lab_events: number;
  total_passports: number;
  total_proof_records: number;
  total_participation_records: number;
  recent_activity: AdminActivity[];
  system_health: { service: string; database: string };
  starknet_status: { status: string; configured_networks: string[] };
  data_source: AdminDataSource;
};

export type AdminProgressSummary = { total: number; completed: number };

export type AdminLearnerSummary = {
  id: string;
  display_name: string | null;
  email: string | null;
  created_at: string;
  last_seen_at: string | null;
  lesson_progress_summary: AdminProgressSummary;
  lab_progress_summary: AdminProgressSummary;
  passport_status_summary: { status: string | null; readiness_level: string | null };
};

export type AdminLearners = {
  items: AdminLearnerSummary[];
  limit: number;
  offset: number;
  total: number;
  data_source: AdminDataSource;
};

export type AdminLessonProgress = {
  lesson_id: string;
  level: string;
  status: string;
  progress_percent: number;
  completed_at: string | null;
  updated_at: string;
};

export type AdminLabProgress = {
  id: string;
  lab_id: string;
  level: string;
  status: string;
  score: number | null;
  safety_score: number | null;
  started_at: string;
  completed_at: string | null;
  updated_at: string;
};

export type AdminPassport = {
  id: string;
  learner_id: string;
  readiness_level: string;
  status: string;
  evidence_count: number;
  starknet_attestation_status: string;
  updated_at: string;
};

export type AdminProof = {
  id: string;
  learner_id: string;
  activity_type: string;
  activity_title: string;
  source: string | null;
  status: string;
  issuer_type: string;
  timestamp: string;
  related_passport_signal: boolean;
  starknet_attestation_status: string;
};

export type AdminParticipation = {
  id: string;
  workshop_id: string;
  status: string;
  registered_at: string;
  updated_at: string;
};

export type AdminLearnerDetail = {
  profile: {
    id: string;
    display_name: string | null;
    email: string | null;
    created_at: string;
    last_seen_at: string | null;
  };
  lesson_progress: AdminLessonProgress[];
  lab_progress: AdminLabProgress[];
  passport_summary: AdminPassport | null;
  evidence_proof_entries: AdminProof[];
  participation_records: AdminParticipation[];
  data_source: AdminDataSource;
};

export type AdminLessons = {
  items: Array<{
    slug: string;
    title: string | null;
    status: string | null;
    estimated_level: string | null;
    completion_count: number;
    updated_at: string | null;
  }>;
  data_source: AdminDataSource;
  catalog_status: string;
};

export type AdminLab = {
  modules: Array<{
    module_id: string;
    name: string | null;
    enabled: boolean | null;
    status: string | null;
    completion_count: number;
  }>;
  recent_lab_events: Array<{
    id: string;
    learner_id: string;
    module_id: string;
    status: string;
    timestamp: string;
  }>;
  data_source: AdminDataSource;
};

export type AdminPassports = { items: AdminPassport[]; data_source: AdminDataSource };
export type AdminProofLedger = { items: AdminProof[]; data_source: AdminDataSource };

export type AdminCommunityPilot = {
  pilot_status: string;
  cohorts: Array<{ id: string; status: string }>;
  sessions: Array<{ id: string; status: string }>;
  participant_count: number;
  notes: string;
  privacy_reminder: string;
  data_source: AdminDataSource;
};

export type AdminStarknet = {
  configured_networks: string[];
  rpc_read_only_status: string;
  last_checked_at: string | null;
  address_account_reader_status: string;
  mainnet_readiness: boolean;
  testnet_readiness: boolean;
  status: string;
  data_source: AdminDataSource;
};

export type AdminSystem = {
  service_name: string;
  environment: string;
  app_version: string;
  database_connectivity_status: string;
  admin_configured: boolean;
  feature_flags: {
    admin_api_v1_read_only: boolean;
    starknet_reader: boolean;
    onchain_writes: boolean;
  };
  safety_checklist: {
    no_wallet_autoconnect: boolean;
    no_signature_prompt: boolean;
    no_transaction_prompt: boolean;
    no_private_key_handling: boolean;
    no_seed_phrase_handling: boolean;
  };
  data_source?: AdminDataSource;
};

export type AdminList<T> = {
  items: T[];
  limit: number;
  offset: number;
  total: number;
  data_source: AdminDataSource;
};

export type AdminSocialReport = {
  id: string;
  reporter_user_id: string;
  reporter_display_name: string;
  target_type: 'post' | 'comment' | string;
  target_id: string;
  reason: string;
  details: string;
  status: string;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  action_id: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminSocialPost = {
  id: string;
  author_user_id: string;
  author_display_name: string;
  kind: string;
  body: string;
  visibility: string;
  status: string;
  comments_count: number;
  reactions: Record<string, number>;
  reports_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type AdminSocialComment = {
  id: string;
  post_id: string;
  author_user_id: string;
  author_display_name: string;
  parent_comment_id: string | null;
  body: string;
  status: string;
  reactions: Record<string, number>;
  reports_count: number;
  created_at: string;
  updated_at: string;
};

export type AdminMlSignal = {
  id: string;
  target_type: 'post' | 'comment' | string;
  target_id: string;
  target_owner_user_id: string | null;
  source: string;
  status: string;
  decision: string;
  categories: string[];
  severity: string;
  score: number;
  summary: string;
  recommendation: string;
  moderation_event_id: string | null;
  model_run_ids: string[];
  created_by_kind: string;
  created_by_user_id: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  review_note: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AdminMlSignals = AdminList<AdminMlSignal>;

export type AdminMlScan = {
  signal: AdminMlSignal;
  rule_decision: {
    decision: string;
    categories: string[];
    score: number;
    severity: string;
    summary: string;
  };
  local_ai: unknown | null;
  external_ai: unknown | null;
  provider_errors: string[];
  auto_action: boolean;
};

export type AdminBulkJob = {
  job: {
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
    created_at: string;
    completed_at: string | null;
  };
  items: Array<{
    id: string;
    bulk_job_id: string;
    target_type: string;
    target_id: string;
    action: string;
    status: string;
    action_id: string | null;
    report_id: string | null;
    message: string;
    created_at: string;
  }>;
  data_source: AdminDataSource;
};

export type AdminBulkModerationRequest = {
  target_type: 'post' | 'comment' | 'report' | string;
  action: 'hide' | 'remove' | 'restore' | 'dismiss_report' | 'mark_reviewed' | string;
  target_ids?: string[];
  targets?: Array<{ target_id: string; report_id?: string | null }>;
  reason?: string;
  dry_run?: boolean;
  idempotency_key?: string;
  payload?: Record<string, unknown>;
};

function trimSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function adminBaseUrl() {
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

export function adminHeaders(context: AdminRequestContext = {}, json = false): Record<string, string> {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (json) headers['content-type'] = 'application/json';

  if (context.mode === 'delegated') {
    const cookieHeader = context.cookieHeader?.trim();
    if (!cookieHeader) throw new AdminApiError(401, 'admin_session_missing', 'Delegated admin session cookie is not available.');
    headers.cookie = cookieHeader;
    return headers;
  }

  headers['x-karyra-admin-token'] = adminToken();
  return headers;
}

export async function parseAdminResponse<T>(response: Response): Promise<AdminSuccessEnvelope<T>> {
  const body = (await response.json().catch(() => null)) as AdminSuccessEnvelope<T> | AdminErrorEnvelope | null;
  if (!response.ok || !body || !body.ok) {
    const error = body && !body.ok ? body.error : null;
    throw new AdminApiError(response.status, error?.code || 'admin_api_error', error?.message || `Admin API request failed (${response.status}).`);
  }
  return body;
}

export async function requestAdmin<T>(fetcher: typeof fetch, path: string, context: AdminRequestContext = {}): Promise<AdminSuccessEnvelope<T>> {
  const response = await fetcher(adminBaseUrl() + path, {
    cache: 'no-store',
    headers: adminHeaders(context),
    signal: AbortSignal.timeout(8000)
  });
  return parseAdminResponse<T>(response);
}

export async function requestAdminJson<T>(fetcher: typeof fetch, path: string, payload: unknown, context: AdminRequestContext = {}): Promise<AdminSuccessEnvelope<T>> {
  const response = await fetcher(adminBaseUrl() + path, {
    method: 'POST',
    cache: 'no-store',
    headers: adminHeaders(context, true),
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15000)
  });
  return parseAdminResponse<T>(response);
}

function listQuery(input: { limit?: number; offset?: number; status?: string; target_type?: string } = {}) {
  const query = new URLSearchParams({ limit: String(input.limit ?? 50), offset: String(input.offset ?? 0) });
  if (input.status) query.set('status', input.status);
  if (input.target_type) query.set('target_type', input.target_type);
  return query;
}

export function adminErrorMessage(error: unknown) {
  if (error instanceof AdminApiError) return error.message;
  if (error instanceof DOMException && error.name === 'TimeoutError') return 'The admin API request timed out.';
  return 'The admin API request could not be completed.';
}

export const adminApi = {
  overview: (fetcher: typeof fetch, context?: AdminRequestContext) => requestAdmin<AdminOverview>(fetcher, '/overview', context),
  learners: (fetcher: typeof fetch, input: { limit?: number; offset?: number } = {}, context?: AdminRequestContext) => {
    const query = new URLSearchParams({ limit: String(input.limit ?? 100), offset: String(input.offset ?? 0) });
    return requestAdmin<AdminLearners>(fetcher, '/learners?' + query, context);
  },
  learner: (fetcher: typeof fetch, id: string, context?: AdminRequestContext) => requestAdmin<AdminLearnerDetail>(fetcher, '/learners/' + encodeURIComponent(id), context),
  lessons: (fetcher: typeof fetch, context?: AdminRequestContext) => requestAdmin<AdminLessons>(fetcher, '/lessons', context),
  lab: (fetcher: typeof fetch, context?: AdminRequestContext) => requestAdmin<AdminLab>(fetcher, '/lab', context),
  passports: (fetcher: typeof fetch, context?: AdminRequestContext) => requestAdmin<AdminPassports>(fetcher, '/passports', context),
  proofLedger: (fetcher: typeof fetch, context?: AdminRequestContext) => requestAdmin<AdminProofLedger>(fetcher, '/proof-ledger', context),
  communityPilot: (fetcher: typeof fetch, context?: AdminRequestContext) => requestAdmin<AdminCommunityPilot>(fetcher, '/community-pilot', context),
  starknet: (fetcher: typeof fetch, context?: AdminRequestContext) => requestAdmin<AdminStarknet>(fetcher, '/starknet', context),
  system: (fetcher: typeof fetch, context?: AdminRequestContext) => requestAdmin<AdminSystem>(fetcher, '/system', context),
  socialReports: (fetcher: typeof fetch, input: { limit?: number; offset?: number; status?: string; target_type?: string } = {}, context?: AdminRequestContext) =>
    requestAdmin<AdminList<AdminSocialReport>>(fetcher, '/social/reports?' + listQuery(input), context),
  socialPosts: (fetcher: typeof fetch, input: { limit?: number; offset?: number; status?: string } = {}, context?: AdminRequestContext) =>
    requestAdmin<AdminList<AdminSocialPost>>(fetcher, '/social/posts?' + listQuery(input), context),
  socialComments: (fetcher: typeof fetch, input: { limit?: number; offset?: number; status?: string } = {}, context?: AdminRequestContext) =>
    requestAdmin<AdminList<AdminSocialComment>>(fetcher, '/social/comments?' + listQuery(input), context),
  mlSignals: (fetcher: typeof fetch, input: { limit?: number; offset?: number; status?: string; target_type?: string } = {}, context?: AdminRequestContext) =>
    requestAdmin<AdminMlSignals>(fetcher, '/social/ml/signals?' + listQuery(input), context),
  mlScan: (fetcher: typeof fetch, input: { target_type: string; target_id: string; use_local_ai?: boolean; use_external_fallback?: boolean; note?: string }, context?: AdminRequestContext) =>
    requestAdminJson<AdminMlScan>(fetcher, '/social/ml/scan', input, context),
  markMlSignalReviewed: (fetcher: typeof fetch, signalId: string, input: { note?: string }, context?: AdminRequestContext) =>
    requestAdminJson<AdminMlSignal>(fetcher, '/social/ml/signals/' + encodeURIComponent(signalId) + '/mark-reviewed', input, context),
  bulkModeration: (fetcher: typeof fetch, input: AdminBulkModerationRequest, context?: AdminRequestContext) =>
    requestAdminJson<AdminBulkJob>(fetcher, '/social/bulk/moderation-actions', input, context)
} as const;
