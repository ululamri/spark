import { fail, type Actions } from '@sveltejs/kit';
import { adminBaseUrl } from '$lib/admin/admin-api';

type Envelope<T> = { ok: true; data: T; generated_at: string } | { ok?: false; error?: string | { code?: string; message?: string } };

type RecoveryInspectData = {
  artifact_id: string;
  reset_request_id: string;
  email: string;
  request_type: 'password' | 'email' | 'totp' | string;
  target_role: 'admin' | 'moderator' | string | null;
  status: string;
  issued_at: string;
  expires_at: string;
  credential_mutation: false;
};

function value(input: FormDataEntryValue | null) {
  return String(input ?? '').trim();
}

function errorMessage(body: Envelope<unknown> | null, fallback: string) {
  if (!body || !('error' in body) || !body.error) return fallback;
  if (typeof body.error === 'string') return body.error;
  return body.error.message || body.error.code || fallback;
}

export const actions: Actions = {
  inspect: async ({ request, fetch }) => {
    const formData = await request.formData();
    const token = value(formData.get('token'));
    const email = value(formData.get('email'));
    if (!token || !email) return fail(400, { token, email, error: 'Recovery artifact token and admin email are required.' });

    const response = await fetch(adminBaseUrl() + '/recovery/inspect', {
      method: 'POST',
      cache: 'no-store',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ token, email }),
      signal: AbortSignal.timeout(15_000)
    });
    const body = (await response.json().catch(() => null)) as Envelope<RecoveryInspectData> | null;
    if (!response.ok || !body || !('ok' in body) || body.ok !== true || !('data' in body)) {
      return fail(response.status, {
        token,
        email,
        error: errorMessage(body, 'Recovery artifact is invalid or expired.')
      });
    }

    return {
      token,
      email,
      artifact: body.data,
      success: 'Recovery artifact verified. Credential recovery execution is not enabled yet.'
    };
  }
};
