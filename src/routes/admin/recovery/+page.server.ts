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
  reset_request_completed?: boolean;
  sessions_revoked: boolean;
};

type TotpRecoverySetupData = {
  artifact_id: string;
  reset_request_id: string;
  factor_id: string;
  issuer: string;
  account_name: string;
  otpauth_uri: string;
  manual_secret: string;
  old_factor_revoked: boolean;
};

type TotpRecoveryConfirmData = {
  artifact_id: string;
  reset_request_id: string;
  factor_id: string;
  email: string;
  target_role: 'admin' | 'moderator' | string | null;
  enabled_at: string;
  old_factors_revoked: boolean;
  reset_request_completed: boolean;
  sessions_revoked: boolean;
};

type EmailRecoveryOtpData = {
  artifact_id: string;
  reset_request_id: string;
  old_email: string;
  new_email: string;
  expires_at: string;
  delivery_mode: string;
  manual_otp: string | null;
  credential_mutation: false;
};

type EmailRecoveryProofData = {
  artifact_id: string;
  reset_request_id: string;
  old_email: string;
  new_email: string;
  email_proof_token: string;
  proof_expires_at: string;
  credential_mutation: false;
};

type EmailRecoveryCompleteData = {
  artifact_id: string;
  reset_request_id: string;
  old_email: string;
  new_email: string;
  target_role: 'admin' | 'moderator' | string | null;
  email_changed_at: string;
  reset_request_completed: boolean;
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
        : result.data.request_type === 'totp'
          ? '2FA recovery artifact verified. Continue by setting up a fresh authenticator.'
          : result.data.request_type === 'email'
            ? 'Email recovery artifact verified. Continue by proving access to the new email.'
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
  },

  setupTotpRecovery: async ({ request, fetch }) => {
    const formData = await request.formData();
    const token = value(formData.get('token'));
    const email = value(formData.get('email'));
    const password = String(formData.get('password') ?? '');
    if (!token || !email || !password) {
      return fail(400, { token, email, error: 'Recovery token, email, and account password are required.' });
    }

    const result = await call<TotpRecoverySetupData>(
      fetch,
      '/recovery/totp/setup',
      { token, email, password },
      '2FA recovery setup failed. The artifact may be invalid, expired, used, or the password may be incorrect.'
    );
    if (!result.ok) return fail(result.status, { token, email, error: result.message });

    return {
      token,
      email,
      totpSetup: result.data,
      success: 'Fresh 2FA setup started. Add the secret to your authenticator, then confirm the new 6-digit code.'
    };
  },

  confirmTotpRecovery: async ({ request, fetch }) => {
    const formData = await request.formData();
    const token = value(formData.get('token'));
    const email = value(formData.get('email'));
    const password = String(formData.get('password') ?? '');
    const factorId = value(formData.get('factor_id'));
    const code = value(formData.get('code'));
    if (!token || !email || !password || !factorId || !code) {
      return fail(400, { token, email, error: 'Recovery token, email, account password, factor ID, and new 2FA code are required.' });
    }

    const result = await call<TotpRecoveryConfirmData>(
      fetch,
      '/recovery/totp/confirm',
      { token, email, password, factor_id: factorId, code },
      '2FA recovery confirmation failed. The artifact may be invalid, expired, used, or the new 2FA code may be incorrect.'
    );
    if (!result.ok) return fail(result.status, { token, email, error: result.message });

    return {
      email,
      totpRecovered: result.data,
      success: '2FA recovered. Old authenticators and existing admin sessions were revoked. Continue to admin login with the new 2FA code.'
    };
  },

  requestEmailProof: async ({ request, fetch }) => {
    const formData = await request.formData();
    const token = value(formData.get('token'));
    const email = value(formData.get('email'));
    const password = String(formData.get('password') ?? '');
    const totpCode = value(formData.get('totp_code'));
    const newEmail = value(formData.get('new_email'));
    if (!token || !email || !password || !totpCode || !newEmail) {
      return fail(400, { token, email, error: 'Recovery token, current email, password, 2FA code, and new email are required.' });
    }

    const result = await call<EmailRecoveryOtpData>(
      fetch,
      '/recovery/email/request',
      { token, email, password, totp_code: totpCode, new_email: newEmail },
      'Email recovery proof request failed. The artifact may be invalid, expired, used, or the credentials may be incorrect.'
    );
    if (!result.ok) return fail(result.status, { token, email, error: result.message });

    return {
      token,
      email,
      emailOtp: result.data,
      success: 'New-email proof requested. Confirm the OTP sent to the new email. Account email is not changed yet.'
    };
  },

  confirmEmailProof: async ({ request, fetch }) => {
    const formData = await request.formData();
    const token = value(formData.get('token'));
    const email = value(formData.get('email'));
    const newEmail = value(formData.get('new_email'));
    const otp = value(formData.get('otp'));
    if (!token || !email || !newEmail || !otp) {
      return fail(400, { token, email, error: 'Recovery token, current email, new email, and OTP are required.' });
    }

    const result = await call<EmailRecoveryProofData>(
      fetch,
      '/recovery/email/confirm',
      { token, email, new_email: newEmail, otp },
      'Email recovery proof confirmation failed. The OTP may be invalid or expired.'
    );
    if (!result.ok) return fail(result.status, { token, email, error: result.message });

    return {
      token,
      email,
      emailProof: result.data,
      success: 'New-email proof confirmed. Complete the final email recovery step.'
    };
  },

  completeEmailRecovery: async ({ request, fetch }) => {
    const formData = await request.formData();
    const token = value(formData.get('token'));
    const email = value(formData.get('email'));
    const newEmail = value(formData.get('new_email'));
    const proofToken = value(formData.get('email_proof_token'));
    if (!token || !email || !newEmail || !proofToken) {
      return fail(400, { token, email, error: 'Recovery token, current email, new email, and proof token are required.' });
    }

    const result = await call<EmailRecoveryCompleteData>(
      fetch,
      '/recovery/email/complete',
      { token, email, new_email: newEmail, email_proof_token: proofToken },
      'Email recovery finalization failed. The proof may be invalid, expired, or the new email may no longer be available.'
    );
    if (!result.ok) return fail(result.status, { token, email, error: result.message });

    return {
      email: result.data.new_email,
      emailRecovered: result.data,
      success: 'Email recovered. Existing admin sessions were revoked. Continue to admin login with the new email.'
    };
  }
};
