import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { adminBaseUrl } from '$lib/admin/admin-api';
import { clearAdminSession, clearDelegatedAdminSession } from '$lib/server/admin-auth';

export const POST: RequestHandler = async ({ cookies, request, fetch }) => {
  const cookieHeader = request.headers.get('cookie');
  if (cookieHeader) {
    await fetch(adminBaseUrl() + '/auth/logout', {
      method: 'POST',
      cache: 'no-store',
      headers: { cookie: cookieHeader },
      signal: AbortSignal.timeout(5000)
    }).catch(() => null);
  }

  clearAdminSession(cookies);
  clearDelegatedAdminSession(cookies);
  redirect(303, '/admin/login');
};
