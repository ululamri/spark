<svelte:head>
  <title>Admin onboarding - Karyra Spark</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Invite-only onboarding</span>
    <h1>Admin onboarding</h1>
    <p>New admin and moderator accounts must start from an invitation approved by superadmin or an authorized admin.</p>

    <div class="admin-login__notice" role="status">
      <strong>Flow locked</strong>
      <p>The invite-token acceptance flow is handled by the backend invite boundary and will be activated after the token, email OTP, password, and 2FA acceptance pass is installed.</p>
    </div>

    <a class="admin-login__back" href="/admin/login">Return to admin login</a>
  </section>
</div>
