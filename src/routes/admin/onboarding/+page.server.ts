import { fail, type Actions } from '@sveltejs/kit';
import { adminBaseUrl } from '$lib/admin/admin-api';

type Envelope<T> = { ok: true; data: T; generated_at: string } | { ok?: false; error?: string | { code?: string; message?: string } };

type InviteInspectData = {
  invitation_id: string;
  email: string;
  role: string;
  capabilities: string[];
  expires_at: string;
  status: string;
};

type InviteEmailOtpData = {
  email: string;
  expires_at: string;
  delivery_mode: string;
  manual_otp?: string | null;
};

type InviteEmailProofData = {
  email: string;
  verified_at: string;
  email_proof_token: string;
  proof_expires_at: string;
};

type InvitePasswordData = {
  user_id: string;
  email: string;
  password_set_at: string;
};

type InviteTotpSetupData = {
  factor_id: string;
  issuer: string;
  account_name: string;
  otpauth_uri: string;
  manual_secret: string;
};

type InviteTotpConfirmData = {
  factor_id: string;
  enabled_at: string;
};

type InviteAcceptData = {
  user_id: string;
  email: string;
  role: string;
  capabilities: string[];
  accepted_at: string;
};

function value(input: FormDataEntryValue | null) {
  return String(input ?? '').trim();
}

function otpValue(input: FormDataEntryValue | null) {
  return String(input ?? '').replace(/\D/g, '').slice(0, 6);
}

function errorMessage(body: Envelope<unknown> | null, fallback: string) {
  if (!body || !('error' in body) || !body.error) return fallback;
  if (typeof body.error === 'string') return body.error;
  return body.error.message || body.error.code || fallback;
}

async function call<T>(fetcher: typeof fetch, path: string, payload: Record<string, unknown>) {
  const response = await fetcher(adminBaseUrl() + '/onboarding' + path, {
    method: 'POST',
    cache: 'no-store',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000)
  });
  const body = (await response.json().catch(() => null)) as Envelope<T> | null;
  if (!response.ok || !body || !('ok' in body) || body.ok !== true || !('data' in body)) {
    return { ok: false as const, status: response.status, message: errorMessage(body, `Admin onboarding request failed (${response.status}).`) };
  }
  return { ok: true as const, data: body.data };
}


export const load = async ({ url }) => {
  return {
    inviteCode: url.searchParams.get('token')?.trim() ?? ''
  };
};

function context(formData: FormData) {
  return {
    token: value(formData.get('token')),
    email: value(formData.get('email')),
    emailProofToken: value(formData.get('email_proof_token')),
    factorId: value(formData.get('factor_id'))
  };
}

export const actions: Actions = {
  inspect: async ({ request, fetch }) => {
    const formData = await request.formData();
    const token = value(formData.get('token'));
    if (!token) return fail(400, { token, onboardingError: 'Invite code is required.' });
    const result = await call<InviteInspectData>(fetch, '/invite/inspect', { token });
    if (!result.ok) return fail(result.status, { token, onboardingError: result.message });
    return { token, email: result.data.email, invite: result.data, onboardingMessage: 'Invite code accepted. Continue with the invited email.' };
  },

  requestEmail: async ({ request, fetch }) => {
    const formData = await request.formData();
    const ctx = context(formData);
    if (!ctx.token || !ctx.email) return fail(400, { ...ctx, emailRequestError: 'Invite code and email are required.' });
    const result = await call<InviteEmailOtpData>(fetch, '/invite/email/request', { token: ctx.token, email: ctx.email });
    if (!result.ok) return fail(result.status, { ...ctx, emailRequestError: result.message });
    return { ...ctx, emailOtp: result.data, onboardingMessage: 'Email OTP was requested.' };
  },

  confirmEmail: async ({ request, fetch }) => {
    const formData = await request.formData();
    const ctx = context(formData);
    const otp = otpValue(formData.get('otp'));
    if (!ctx.token || !ctx.email || !otp) return fail(400, { ...ctx, emailConfirmError: 'Invite code, email, and OTP are required.' });
    const result = await call<InviteEmailProofData>(fetch, '/invite/email/confirm', { token: ctx.token, email: ctx.email, otp });
    if (!result.ok) return fail(result.status, { ...ctx, emailConfirmError: result.message });
    return {
      ...ctx,
      emailProofToken: result.data.email_proof_token,
      emailProof: result.data,
      onboardingMessage: 'Email verified. Continue to set password.'
    };
  },

  setPassword: async ({ request, fetch }) => {
    const formData = await request.formData();
    const ctx = context(formData);
    const password = String(formData.get('password') ?? '');
    const displayName = value(formData.get('display_name'));
    if (!ctx.token || !ctx.email || !ctx.emailProofToken || !password) {
      return fail(400, { ...ctx, passwordError: 'Invite code, email, email proof token, and password are required.' });
    }
    const result = await call<InvitePasswordData>(fetch, '/invite/password', {
      token: ctx.token,
      email: ctx.email,
      email_proof_token: ctx.emailProofToken,
      password,
      display_name: displayName || undefined
    });
    if (!result.ok) return fail(result.status, { ...ctx, passwordError: result.message });

    const setup = await call<InviteTotpSetupData>(fetch, '/invite/totp/setup', {
      token: ctx.token,
      email: ctx.email,
      email_proof_token: ctx.emailProofToken,
      password
    });
    if (!setup.ok) {
      return fail(setup.status, {
        ...ctx,
        passwordSet: result.data,
        totpSetupError: setup.message,
        onboardingMessage: 'Password saved. 2FA setup could not be created yet.'
      });
    }

    return {
      ...ctx,
      passwordSet: result.data,
      factorId: setup.data.factor_id,
      totpSetup: setup.data,
      onboardingMessage: 'Password saved. Scan the QR code, then confirm the 2FA code.'
    };
  },

  setupTotp: async ({ request, fetch }) => {
    const formData = await request.formData();
    const ctx = context(formData);
    const password = String(formData.get('password') ?? '');
    if (!ctx.token || !ctx.email || !ctx.emailProofToken || !password) {
      return fail(400, { ...ctx, totpSetupError: 'Invite code, email, email proof token, and password are required.' });
    }
    const result = await call<InviteTotpSetupData>(fetch, '/invite/totp/setup', {
      token: ctx.token,
      email: ctx.email,
      email_proof_token: ctx.emailProofToken,
      password
    });
    if (!result.ok) return fail(result.status, { ...ctx, totpSetupError: result.message });
    return { ...ctx, factorId: result.data.factor_id, totpSetup: result.data, onboardingMessage: 'Authenticator factor created. Confirm the 6-digit code.' };
  },

  confirmTotp: async ({ request, fetch }) => {
    const formData = await request.formData();
    const ctx = context(formData);
    const password = String(formData.get('password') ?? '');
    const code = otpValue(formData.get('code'));
    if (!ctx.token || !ctx.email || !ctx.emailProofToken || !password || !ctx.factorId || !code) {
      return fail(400, { ...ctx, totpConfirmError: 'Invite code, email, email proof token, password, factor ID, and 2FA code are required.' });
    }
    const result = await call<InviteTotpConfirmData>(fetch, '/invite/totp/confirm', {
      token: ctx.token,
      email: ctx.email,
      email_proof_token: ctx.emailProofToken,
      password,
      factor_id: ctx.factorId,
      code
    });
    if (!result.ok) return fail(result.status, { ...ctx, totpConfirmError: result.message });

    const accepted = await call<InviteAcceptData>(fetch, '/invite/accept', {
      token: ctx.token,
      email: ctx.email,
      email_proof_token: ctx.emailProofToken,
      password
    });
    if (!accepted.ok) {
      return fail(accepted.status, {
        ...ctx,
        totpConfirmed: result.data,
        acceptError: accepted.message,
        onboardingMessage: '2FA enabled. Final activation could not be completed yet.'
      });
    }

    return {
      ...ctx,
      totpConfirmed: result.data,
      accepted: accepted.data,
      onboardingMessage: 'Admin access activated. You can now log in from the admin panel.'
    };
  },

  accept: async ({ request, fetch }) => {
    const formData = await request.formData();
    const ctx = context(formData);
    const password = String(formData.get('password') ?? '');
    if (!ctx.token || !ctx.email || !ctx.emailProofToken || !password) {
      return fail(400, { ...ctx, acceptError: 'Invite code, email, email proof token, and password are required.' });
    }
    const result = await call<InviteAcceptData>(fetch, '/invite/accept', {
      token: ctx.token,
      email: ctx.email,
      email_proof_token: ctx.emailProofToken,
      password
    });
    if (!result.ok) return fail(result.status, { ...ctx, acceptError: result.message });
    return { ...ctx, accepted: result.data, onboardingMessage: 'Invitation accepted. You can now log in from the admin panel.' };
  }
};
