import { env as privateEnv } from '$env/dynamic/private';
import { env as publicEnv } from '$env/dynamic/public';

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

async function requestAdmin<T>(fetcher: typeof fetch, path: string): Promise<AdminSuccessEnvelope<T>> {
  const response = await fetcher(adminBaseUrl() + path, {
    headers: {
      accept: 'application/json',
      'x-karyra-admin-token': adminToken()
    },
    signal: AbortSignal.timeout(8000)
  });
  const body = (await response.json().catch(() => null)) as AdminSuccessEnvelope<T> | AdminErrorEnvelope | null;
  if (!response.ok || !body || !body.ok) {
    const error = body && !body.ok ? body.error : null;
    throw new AdminApiError(response.status, error?.code || 'admin_api_error', error?.message || `Admin API request failed (${response.status}).`);
  }
  return body;
}

export function adminErrorMessage(error: unknown) {
  if (error instanceof AdminApiError) return error.message;
  if (error instanceof DOMException && error.name === 'TimeoutError') return 'The admin API request timed out.';
  return 'The admin API request could not be completed.';
}

export const adminApi = {
  overview: (fetcher: typeof fetch) => requestAdmin<AdminOverview>(fetcher, '/overview'),
  learners: (fetcher: typeof fetch, input: { limit?: number; offset?: number } = {}) => {
    const query = new URLSearchParams({ limit: String(input.limit ?? 100), offset: String(input.offset ?? 0) });
    return requestAdmin<AdminLearners>(fetcher, '/learners?' + query);
  },
  learner: (fetcher: typeof fetch, id: string) => requestAdmin<AdminLearnerDetail>(fetcher, '/learners/' + encodeURIComponent(id)),
  lessons: (fetcher: typeof fetch) => requestAdmin<AdminLessons>(fetcher, '/lessons'),
  lab: (fetcher: typeof fetch) => requestAdmin<AdminLab>(fetcher, '/lab'),
  passports: (fetcher: typeof fetch) => requestAdmin<AdminPassports>(fetcher, '/passports'),
  proofLedger: (fetcher: typeof fetch) => requestAdmin<AdminProofLedger>(fetcher, '/proof-ledger'),
  communityPilot: (fetcher: typeof fetch) => requestAdmin<AdminCommunityPilot>(fetcher, '/community-pilot'),
  starknet: (fetcher: typeof fetch) => requestAdmin<AdminStarknet>(fetcher, '/starknet'),
  system: (fetcher: typeof fetch) => requestAdmin<AdminSystem>(fetcher, '/system')
} as const;
