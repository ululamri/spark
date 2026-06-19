import {
  requestAdmin,
  requestAdminJson,
  type AdminDataSource,
  type AdminRequestContext,
  type AdminSuccessEnvelope
} from '$lib/admin/admin-api';

export type AdminCmsItem = {
  id: string;
  kind: 'core_lesson' | 'lab' | string;
  slug: string;
  title: string;
  status: 'draft' | 'review' | 'published' | 'archived' | string;
  current_revision_id: string | null;
  current_version: number | null;
  published_at: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminCmsRevision = {
  id: string;
  item_id: string;
  version: number;
  payload: Record<string, unknown>;
  summary: string;
  created_by_kind: string;
  created_by_user_id: string | null;
  created_at: string;
};

export type AdminCmsItems = {
  items: AdminCmsItem[];
  total: number;
  limit: number;
  offset: number;
  data_source: AdminDataSource;
};

export type AdminCmsWriteResult = {
  item: AdminCmsItem;
  revision: AdminCmsRevision;
};

function itemsQuery(input: { limit?: number; offset?: number; kind?: string; status?: string; q?: string } = {}) {
  const query = new URLSearchParams({ limit: String(input.limit ?? 50), offset: String(input.offset ?? 0) });
  if (input.kind && input.kind !== 'all') query.set('kind', input.kind);
  if (input.status && input.status !== 'all') query.set('status', input.status);
  if (input.q) query.set('q', input.q);
  return query;
}

export const adminCmsApi = {
  items: (
    fetcher: typeof fetch,
    input: { limit?: number; offset?: number; kind?: string; status?: string; q?: string } = {},
    context?: AdminRequestContext
  ): Promise<AdminSuccessEnvelope<AdminCmsItems>> => requestAdmin<AdminCmsItems>(fetcher, '/cms/items?' + itemsQuery(input), context),
  createItem: (
    fetcher: typeof fetch,
    input: { kind: string; slug: string; title: string; status?: string; summary?: string; payload?: Record<string, unknown> },
    context?: AdminRequestContext
  ): Promise<AdminSuccessEnvelope<AdminCmsWriteResult>> => requestAdminJson<AdminCmsWriteResult>(fetcher, '/cms/items', input, context)
} as const;
