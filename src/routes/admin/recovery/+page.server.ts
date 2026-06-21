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

type PasswordRecoveryData = {
  artifact_id: string;
  reset_request_id: string;
  email: string;
  target_role: 'admin' | 'moderator' | string | null;
  password_changed_at: string;
  sessions_revoked: boolean;
};

function value(input: FormDataEntryValue | null) {
  return String(input ?? '').trim();
}

function errorMessage(body: Envelope<unknown> | null, fallback: string) {
  if (!body || !('error' in body) || !body.error) return fallback;
  if (typeof body.error === 'string') return body.error;
  return body.error.message || body.error.code || fallback;
}

async function call<T>(fetcher: typeof fetch, path: string, payload: Record<string, unknown>, fallback: string) {
  const response = await fetcher(adminBaseUrl() + path, {
    method: 'POST',
    cache: 'no-store',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000)
  });
  const body = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok || !body || !('ok' in body) || body.ok !== true || !('data' in body)) {
    return { ok: false as const, status: response.status, message: errorMessage(body, fallback) };
  }
  return { ok: true as const, data: body.data };
}

export const actions: Actions = {
  inspect: async ({ request, fetch }) => {
    const formData = await request.formData();
    const token = value(formData.get('token'));
    const email = value(formData.get('email'));
    if (!token || !email) return fail(400, { token, email, error: 'Recovery artifact token and admin email are required.' });

    const result = await call<RecoveryInspectData>(fetch, '/recovery/inspect', { token, email }, 'Recovery artifact is invalid or expired.');
    if (!result.ok) return fail(result.status, { token, email, error: result.message });

    return {
      token,
      email,
      artifact: result.data,
      success: result.data.request_type === 'password'
        ? 'Recovery artifact verified. Continue with a fresh password and current 2FA code.'
        : 'Recovery artifact verified. Execution for this recovery type is not enabled yet.'
    };
  },

  recoverPassword: async ({ request, fetch }) => {
    const formData = await request.formData();
    const token = value(formData.get('token'));
    const email = value(formData.get('email'));
    const newPassword = String(formData.get('new_password') ?? '');
    const totpCode = value(formData.get('totp_code'));
    if (!token || !email || !newPassword || !totpCode) {
      return fail(400, { token, email, error: 'Recovery token, email, fresh password, and 2FA code are required.' });
    }

    const result = await call<PasswordRecoveryData>(
      fetch,
      '/recovery/password',
      { token, email, new_password: newPassword, totp_code: totpCode },
      'Password recovery failed. The artifact may be invalid, expired, used, or the 2FA code may be incorrect.'
    );
    if (!result.ok) return fail(result.status, { token, email, error: result.message });

    return {
      email,
      passwordRecovered: result.data,
      success: 'Password recovered. Existing admin sessions were revoked. Continue to admin login with the new password.'
    };
  }
};
