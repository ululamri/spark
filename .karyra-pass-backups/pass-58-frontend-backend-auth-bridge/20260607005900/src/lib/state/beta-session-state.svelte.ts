export type BetaUserRole = 'learner' | 'facilitator' | 'explorer';
export type BetaUserMode = 'beginner' | 'guided' | 'explorer';
export type BetaUserStatus = 'local-session' | 'backend-session';

export type BetaUser = {
  id: string;
  name: string;
  handle: string;
  email?: string;
  role: BetaUserRole;
  mode: BetaUserMode;
  status: BetaUserStatus;
  createdAt: string;
};

export type SessionInput = {
  name?: string;
  email: string;
  mode?: BetaUserMode;
};

const STORAGE_KEY = 'karyra-spark-session-v2';
const LEGACY_STORAGE_KEYS = ['karyra-spark-beta-session-v1'];

export const betaSession = $state({
  ready: false,
  user: null as BetaUser | null
});

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function titleFromEmail(email: string) {
  const local = email.split('@')[0] ?? '';
  const words = local
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .map((part) => part.trim())
    .filter(Boolean);

  return words.map((part) => part.slice(0, 1).toUpperCase() + part.slice(1)).join(' ') || 'Pengguna Karyra';
}

function normalizeHandle(input: string) {
  const seed = input
    .trim()
    .toLowerCase()
    .replace(/^@/, '')
    .replace(/@.*$/, '')
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 28);

  return `@${seed || 'karyra'}`;
}

function createSessionId(email: string) {
  const cryptoId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const emailSeed = normalizeHandle(email).replace('@', '');
  return `user-${emailSeed}-${cryptoId}`;
}

function isValidUser(value: Partial<BetaUser> | null): value is BetaUser {
  if (!value?.id || !value.name || !value.handle || !value.mode) return false;
  if (value.status !== 'local-session' && value.status !== 'backend-session') return false;
  if (value.id.includes('spark-local') || value.id.includes('example')) return false;
  return true;
}

function safeParseSession(raw: string | null) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<BetaUser>;
    if (!isValidUser(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function restoreBetaSession() {
  if (typeof window === 'undefined') return;

  for (const legacyKey of LEGACY_STORAGE_KEYS) {
    window.localStorage.removeItem(legacyKey);
  }

  betaSession.user = safeParseSession(window.localStorage.getItem(STORAGE_KEY));
  betaSession.ready = true;
}

export function saveBetaSession(user: BetaUser | null) {
  if (typeof window === 'undefined') return;

  if (!user) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function startLearningSession(input: SessionInput) {
  const email = normalizeEmail(input.email);
  const name = input.name?.trim() || titleFromEmail(email);
  const mode = input.mode ?? 'beginner';

  const user: BetaUser = {
    id: createSessionId(email),
    name,
    handle: normalizeHandle(email || name),
    email,
    role: mode === 'explorer' ? 'explorer' : 'learner',
    mode,
    status: 'local-session',
    createdAt: new Date().toISOString()
  };

  betaSession.user = user;
  betaSession.ready = true;
  saveBetaSession(user);
  return user;
}

export function logoutBetaSession() {
  betaSession.user = null;
  betaSession.ready = true;
  saveBetaSession(null);
}

export function isSignedIn() {
  return Boolean(betaSession.user);
}

export function getModeLabel(mode: BetaUserMode) {
  if (mode === 'beginner') return 'Pemula';
  if (mode === 'guided') return 'Terarah';
  return 'Penjelajah';
}
