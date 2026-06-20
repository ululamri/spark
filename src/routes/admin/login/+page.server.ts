import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { adminBaseUrl } from '$lib/admin/admin-api';
import {
  DELEGATED_ADMIN_COOKIE_NAME,
  checkAdminLoginRateLimit,
  getAdminAuthConfig,
  resetAdminLoginRateLimit,
  setAdminSession,
  setDelegatedAdminSession,
  verifyAdminPassword
} from '$lib/server/admin-auth';

function clientKey(getClientAddress: () => string, suffix: string) {
  try {
    return `${suffix}:${getClientAddress()}`;
  } catch {
    return `${suffix}:unknown-client`;
  }
}

function delegatedSessionToken(setCookie: string | null) {
  if (!setCookie) return null;
  const escaped = DELEGATED_ADMIN_COOKIE_NAME.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = setCookie.match(new RegExp(`${escaped}=([^;]+)`));
  return match?.[1] ?? null;
}

async function delegatedLogin(fetcher: typeof fetch, email: string, password: string) {
  return fetcher(adminBaseUrl() + '/auth/login', {
    method: 'POST',
    cache: 'no-store',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json'
    },
    body: JSON.stringify({ email, password }),
    signal: AbortSignal.timeout(10_000)
  });
}

export const actions: Actions = {
  superadmin: async ({ request, cookies, url, getClientAddress }) => {
    const config = getAdminAuthConfig();
    if (!config.configured) {
      return fail(503, { superadminMessage: 'Superadmin access is not configured for this deployment.' });
    }

    const key = clientKey(getClientAddress, 'superadmin');
    const rateLimit = checkAdminLoginRateLimit(key);
    if (!rateLimit.allowed) {
      return fail(429, { superadminMessage: 'Too many attempts. Try again in ' + rateLimit.retryAfterSeconds + ' seconds.' });
    }

    const formData = await request.formData();
    const password = String(formData.get('password') ?? '');
    if (!verifyAdminPassword(password)) {
      return fail(401, { superadminMessage: 'Superadmin credential was not accepted.' });
    }

    resetAdminLoginRateLimit(key);
    setAdminSession(cookies, url.protocol === 'https:');
    redirect(303, '/admin');
  },

  delegated: async ({ request, cookies, url, fetch, getClientAddress }) => {
    const key = clientKey(getClientAddress, 'delegated');
    const rateLimit = checkAdminLoginRateLimit(key);
    if (!rateLimit.allowed) {
      return fail(429, { delegatedMessage: 'Too many attempts. Try again in ' + rateLimit.retryAfterSeconds + ' seconds.' });
    }

    const formData = await request.formData();
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');
    if (!email || !password) return fail(400, { delegatedMessage: 'Email and password are required.' });

    const response = await delegatedLogin(fetch, email, password).catch(() => null);
    if (!response) return fail(503, { delegatedMessage: 'Delegated admin API could not be reached.' });
    if (!response.ok) return fail(response.status, { delegatedMessage: 'Delegated admin credential was not accepted.' });

    const token = delegatedSessionToken(response.headers.get('set-cookie'));
    if (!token) return fail(502, { delegatedMessage: 'Delegated admin session cookie was not returned by the API.' });

    resetAdminLoginRateLimit(key);
    setDelegatedAdminSession(cookies, token, url.protocol === 'https:');
    redirect(303, '/admin');
  }
};
