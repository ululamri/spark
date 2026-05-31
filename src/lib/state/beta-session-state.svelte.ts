export type BetaUserRole = 'learner' | 'facilitator' | 'explorer';

export type BetaUser = {
  id: string;
  name: string;
  handle: string;
  role: BetaUserRole;
  mode: 'beginner' | 'guided' | 'explorer';
  status: 'local-example';
};

const STORAGE_KEY = 'karyra-spark-beta-session-v1';

export const betaSession = $state({
  ready: false,
  user: null as BetaUser | null
});

export const exampleUsers: BetaUser[] = [
  {
    id: 'spark-local-learner',
    name: 'Karyra Learner',
    handle: '@spark-learner',
    role: 'learner',
    mode: 'beginner',
    status: 'local-example'
  },
  {
    id: 'spark-guided-builder',
    name: 'Guided Builder',
    handle: '@guided-builder',
    role: 'learner',
    mode: 'guided',
    status: 'local-example'
  },
  {
    id: 'spark-explorer',
    name: 'Starknet Explorer',
    handle: '@spark-explorer',
    role: 'explorer',
    mode: 'explorer',
    status: 'local-example'
  }
];

function safeParseSession(raw: string | null) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as BetaUser;
    if (!parsed?.id || !parsed?.name || !parsed?.handle) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function restoreBetaSession() {
  if (typeof window === 'undefined') return;

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

export function loginAsExample(userId = 'spark-local-learner') {
  const user = exampleUsers.find((item) => item.id === userId) ?? exampleUsers[0];
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

export function getModeLabel(mode: BetaUser['mode']) {
  if (mode === 'beginner') return 'Baru mulai';
  if (mode === 'guided') return 'Terarah';
  return 'Penjelajah';
}
