export type SparkMediaVisibility = 'public' | 'private';
export type SparkMediaStatus = 'pending' | 'uploaded' | 'linked';

export type SparkMediaAsset = {
  id: string;
  bucket: string;
  object_key: string;
  original_file_name: string;
  mime_type: string;
  size_bytes: number;
  checksum: string | null;
  visibility: SparkMediaVisibility | string;
  status: SparkMediaStatus | string;
  storage_provider: string;
  upload_method: string;
  upload_expires_at: string | null;
  uploaded_at: string | null;
  public_url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type SparkMediaUploadIntent = {
  asset: SparkMediaAsset;
  provider: string;
  upload_method: string;
  upload_url: string;
  expires_at: string;
  note: string;
};

export type SparkMediaLink = {
  id: string;
  media_asset_id: string;
  entity_type: string;
  entity_id: string;
  purpose: string;
  created_at: string;
};

export type SparkMediaPolicy = {
  provider: string;
  current_phase: string;
  max_upload_bytes: number;
  upload_ttl_minutes: number;
  allowed_mime_prefixes: string[];
  accepted_purposes: string[];
  physical_buckets: string[];
  note: string;
};

export type CreateUploadIntentInput = {
  purpose: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  private?: boolean;
  checksum?: string;
  entity_type?: string;
  entity_id?: string;
  metadata?: Record<string, unknown>;
};

export type CompleteUploadInput = {
  checksum?: string;
  size_bytes?: number;
  metadata?: Record<string, unknown>;
};

export type CreateMediaLinkInput = {
  entity_type: string;
  entity_id: string;
  purpose: string;
};

const API_BASE = (import.meta.env.PUBLIC_API_BASE || import.meta.env.PUBLIC_SPARK_API_BASE || '').replace(/\/$/, '');
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

function apiUrl(path: string) {
  return `${API_BASE}${path}`;
}

export function publicApiUrl(path?: string | null) {
  if (!path) return undefined;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return apiUrl(path.startsWith('/') ? path : `/${path}`);
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

function messageFromErrorBody(body: unknown, fallback: string) {
  if (body && typeof body === 'object' && 'error' in body && typeof body.error === 'string') {
    if (body.error.includes('unauthorized')) return 'Sesi kamu sudah berakhir. Masuk lagi untuk memakai media akun.';
    if (body.error.includes('purpose')) return 'Tujuan media belum didukung.';
    if (body.error.includes('mime_type')) return 'Jenis file belum didukung.';
    if (body.error.includes('size_bytes')) return 'Ukuran file terlalu besar untuk batas MVP.';
    return body.error;
  }
  return fallback;
}

async function apiRequest<T>(path: string, init: RequestInit = {}, fallback: string): Promise<T> {
  const response = await fetch(apiUrl(path), {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const body = await readJson<unknown>(response).catch(() => null);
    throw new Error(messageFromErrorBody(body, fallback));
  }

  return readJson<T>(response);
}

function validateUploadFile(file: File, purpose: string) {
  const mimeType = file.type || 'application/octet-stream';
  const allowed = mimeType.startsWith('image/') || mimeType === 'application/pdf' || mimeType.startsWith('text/');
  if (!allowed) throw new Error('File harus berupa gambar, PDF, atau teks.');
  if (purpose === 'avatar' && !mimeType.startsWith('image/')) throw new Error('Foto profil harus berupa gambar PNG, JPG, atau WebP.');
  if (file.size <= 0) throw new Error('File kosong tidak bisa diunggah.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Ukuran file maksimal 8 MB.');
}

export async function getMediaPolicy(): Promise<SparkMediaPolicy> {
  return apiRequest<SparkMediaPolicy>('/v1/media/policy', {}, 'Kebijakan media belum bisa dibaca dari Spark API.');
}

export async function listMyMediaAssets(): Promise<{ items: SparkMediaAsset[] }> {
  return apiRequest<{ items: SparkMediaAsset[] }>('/v1/media/me/assets', {}, 'Daftar media belum bisa dibaca dari Spark API.');
}

export async function createMediaUploadIntent(input: CreateUploadIntentInput): Promise<SparkMediaUploadIntent> {
  return apiRequest<SparkMediaUploadIntent>(
    '/v1/media/upload-intents',
    { method: 'POST', body: JSON.stringify(input) },
    'Upload media belum bisa disiapkan.'
  );
}

export async function completeMediaUpload(assetId: string, input: CompleteUploadInput = {}): Promise<SparkMediaAsset> {
  return apiRequest<SparkMediaAsset>(
    `/v1/media/assets/${encodeURIComponent(assetId)}/complete`,
    { method: 'POST', body: JSON.stringify(input) },
    'Status media belum bisa diselesaikan.'
  );
}

export async function createMediaAssetLink(assetId: string, input: CreateMediaLinkInput): Promise<SparkMediaLink> {
  return apiRequest<SparkMediaLink>(
    `/v1/media/assets/${encodeURIComponent(assetId)}/links`,
    { method: 'POST', body: JSON.stringify(input) },
    'Media belum bisa ditautkan ke akun.'
  );
}

export async function uploadPublicMediaFile(file: File, purpose: 'avatar' | 'community') {
  validateUploadFile(file, purpose);

  const intent = await createMediaUploadIntent({
    purpose,
    file_name: file.name || `${purpose}-upload.bin`,
    mime_type: file.type || 'application/octet-stream',
    size_bytes: file.size,
    private: false,
    metadata: { source: `${purpose}-upload` }
  });

  const uploadResponse = await fetch(intent.upload_url, {
    method: intent.upload_method || 'PUT',
    headers: { 'Content-Type': file.type || 'application/octet-stream' },
    body: file
  });

  if (!uploadResponse.ok) throw new Error('Media belum bisa diunggah ke object storage.');

  return completeMediaUpload(intent.asset.id, { size_bytes: file.size });
}
