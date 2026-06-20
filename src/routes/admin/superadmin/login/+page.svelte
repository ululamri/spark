<script lang="ts">
  let { data, form } = $props();
</script>

<svelte:head>
  <title>Superadmin login - Karyra Spark</title>
</svelte:head>

<div class="admin-login">
  <section class="admin-login__card">
    <img src="/assets/brand/icon-only.svg" alt="" width="48" height="48" />
    <span class="admin-eyebrow">Root authority</span>
    <h1>Karyra Spark Superadmin</h1>
    <p>This private entry is reserved for the root operator. Delegated admin and moderator accounts must use the standard admin panel login.</p>

    {#if !data.adminConfigured}
      <div class="admin-login__notice" role="status">
        <strong>Superadmin access is disabled.</strong>
        <p>Configure the private superadmin environment values on the server before using this root boundary.</p>
      </div>
    {:else}
      <form method="POST" action="?/superadmin" class="admin-login__form">
        <label for="admin-password">Root credential</label>
        <input
          id="admin-password"
          name="password"
          type="password"
          autocomplete="current-password"
          minlength="12"
          required
        />
        {#if form?.superadminMessage}<p class="admin-form-error" role="alert">{form.superadminMessage}</p>{/if}
        <button type="submit">Enter root console</button>
      </form>
    {/if}

    <a class="admin-login__back" href="/admin/login">Go to admin/moderator login</a>
  </section>
</div>
