import { fail, type Actions } from '@sveltejs/kit';
import { adminBaseUrl } from '$lib/admin/admin-api';

type ResetReceipt = {
  status: string;
  message: string;
};

type Envelope<T> = { ok: true; data: T; generated_at: string } | { ok?: false; error?: string | { code?: string; message?: string } };

function value(input: FormDataEntryValue | null) {
  return String(input ?? '').trim();
}

function errorMessage(body: Envelope<unknown> | null, fallback: string) {
  if (!body || !('error' in body) || !body.error) return fallback;
  if (typeof body.error === 'string') return body.error;
  return body.error.message || body.error.code || fallback;
}

export const actions: Actions = {
  default: async ({ request, fetch }) => {
    const formData = await request.formData();
    const email = value(formData.get('email'));
    const requestType = value(formData.get('request_type'));
    const note = value(formData.get('note'));

    if (!email || !requestType) {
      return fail(400, { error: 'Email and request type are required.', email, requestType, note });
    }

    const response = await fetch(adminBaseUrl() + '/reset/request', {
      method: 'POST',
      cache: 'no-store',
      headers: { accept: 'application/json', 'content-type': 'application/json' },
      body: JSON.stringify({ email, request_type: requestType, note: note || undefined }),
      signal: AbortSignal.timeout(15_000)
    });

    const body = (await response.json().catch(() => null)) as Envelope<ResetReceipt> | null;
    if (!response.ok || !body || !('ok' in body) || body.ok !== true || !('data' in body)) {
      return fail(response.status, {
        error: errorMessage(body, 'Reset request could not be submitted.'),
        email,
        requestType,
        note
      });
    }

    return {
      email,
      requestType,
      success: body.data.message
    };
  }
};
