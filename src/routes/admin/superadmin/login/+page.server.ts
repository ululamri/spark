import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { checkAdminLoginRateLimit, getAdminAuthConfig, resetAdminLoginRateLimit, setAdminSession, verifyAdminPassword } from '$lib/server/admin-auth';

function clientKey(getClientAddress: () => string, suffix: string) {
  try {
    return `${suffix}:${getClientAddress()}`;
  } catch {
    return `${suffix}:unknown-client`;
  }
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
  }
};
