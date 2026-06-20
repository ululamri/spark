import { fail, type Actions } from '@sveltejs/kit';
import { adminBaseUrl } from '$lib/admin/admin-api';

type Envelope<T> = { ok: boolean; data?: T; error?: { code: string; message: string } };

function value(input: FormDataEntryValue | null) {
  return String(input ?? '').trim();
}

async function call<T>(fetcher: typeof fetch, path: string, payload: Record<string, unknown>) {
  const response = await fetcher(adminBaseUrl() + path, {
    method: 'POST',
    cache: 'no-store',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10_000)
  });
  const body = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok || !body?.ok || !body.data) {
    return { ok: false as const, status: response.status, message: body?.error?.message || `Admin setup request failed (${response.status}).` };
  }
  return { ok: true as const, data: body.data };
}

export const actions: Actions = {
  requestEmail: async ({ request, fetch }) => {
    const formData = await request.formData();
    const email = value(formData.get('email'));
    const credential = String(formData.get('credential') ?? '');
    if (!email || !credential) return fail(400, { emailRequestError: 'Email and credential are required.' });
    const result = await call(fetch, '/auth/email/request', { email, password: credential });
    if (!result.ok) return fail(result.status, { emailRequestError: result.message });
    return { emailRequest: result.data };
  },

  confirmEmail: async ({ request, fetch }) => {
    const formData = await request.formData();
    const email = value(formData.get('email'));
    const credential = String(formData.get('credential') ?? '');
    const token = value(formData.get('token'));
    if (!email || !credential || !token) return fail(400, { emailConfirmError: 'Email, credential, and token are required.' });
    const result = await call(fetch, '/auth/email/confirm', { email, password: credential, token });
    if (!result.ok) return fail(result.status, { emailConfirmError: result.message });
    return { emailConfirm: result.data };
  },

  setupTotp: async ({ request, fetch }) => {
    const formData = await request.formData();
    const email = value(formData.get('email'));
    const credential = String(formData.get('credential') ?? '');
    if (!email || !credential) return fail(400, { totpSetupError: 'Email and credential are required.' });
    const result = await call(fetch, '/auth/totp/setup', { email, password: credential });
    if (!result.ok) return fail(result.status, { totpSetupError: result.message });
    return { totpSetup: result.data };
  },

  confirmTotp: async ({ request, fetch }) => {
    const formData = await request.formData();
    const email = value(formData.get('email'));
    const credential = String(formData.get('credential') ?? '');
    const factorId = value(formData.get('factor_id'));
    const code = value(formData.get('code'));
    if (!email || !credential || !factorId || !code) return fail(400, { totpConfirmError: 'Email, credential, factor ID, and 2FA code are required.' });
    const result = await call(fetch, '/auth/totp/confirm', { email, password: credential, factor_id: factorId, code });
    if (!result.ok) return fail(result.status, { totpConfirmError: result.message });
    return { totpConfirm: result.data };
  }
};
