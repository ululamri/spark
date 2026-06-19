<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';

  type Operation = {
    id: string;
    title: string;
    href: string;
    capability: string;
    fallback?: string;
    detail: string;
  };

  let { data, form } = $props();

  const actor = $derived(data.actor);
  const capabilities = $derived(actor?.capabilities ?? []);

  function booleanTone(value: boolean) {
    return value ? 'success' as const : 'neutral' as const;
  }

  function label(value: boolean) {
    return value ? 'Enabled' : 'Disabled';
  }

  function can(capability: string) {
    return capabilities.includes(capability);
  }

  const operationItems: Operation[] = [
    { id: 'team', title: 'Admin team', href: '/admin/team', capability: 'admin_manage', fallback: 'audit_read', detail: 'Manage or inspect delegated admin and moderator assignments.' },
    { id: 'audit', title: 'Audit log', href: '/admin/audit', capability: 'audit_read', detail: 'Read append-only admin audit events.' },
    { id: 'moderation', title: 'Moderation', href: '/admin/moderation', capability: 'moderation_read', detail: 'Review reports, posts, comments, ML signals, and bulk moderation jobs.' },
    { id: 'content', title: 'Learn & Lab CMS', href: '/admin/content', capability: 'content_read', detail: 'Read and operate learning/lab content workspace.' },
    { id: 'publish', title: 'Publish controls', href: '/admin/content', capability: 'content_publish', detail: 'Publish or archive CMS content when CMS editing is enabled.' }
  ];

  const operations = $derived(operationItems);
</script>

<svelte:head><title>Operations - Karyra Spark Admin</title></svelte:head>
<AdminHeader title="Operations" description="Role-aware admin operations. This page shows only live backend-backed status and actions allowed by the current admin context." />

{#if form?.success}
  <div class="admin-note admin-note--success">{form.success}</div>
{:else if form?.error}
  <div class="admin-note admin-note--danger">{form.error}</div>
{/if}

{#if data.apiError}
  <AdminEmptyState state="error" title="Operational data could not be loaded" detail={data.apiError} />
{/if}

<div class="admin-card-grid">
  <AdminSectionCard eyebrow="Current actor" title="Role and capability context" description="The sidebar and page actions are derived from this backend-backed admin context.">
    <ul class="admin-list">
      <li><strong>Mode:</strong> {actor?.mode ?? 'unknown'}</li>
      <li><strong>Role:</strong> {actor?.role ?? 'unknown'}</li>
      <li><strong>Actor kind:</strong> {actor?.actorKind ?? data.backendActor?.actor_kind ?? 'unknown'}</li>
      <li><strong>Actor user:</strong> {actor?.actorUserId ?? data.backendActor?.actor_user_id ?? 'root/session'}</li>
      <li><strong>Capabilities:</strong> {capabilities.length}</li>
    </ul>
  </AdminSectionCard>

  {#if data.system}
    <AdminSectionCard eyebrow="System" title="Runtime diagnostics" description="Safe operational state from the protected backend system endpoint.">
      <ul class="admin-list">
        <li><strong>Service:</strong> {data.system.service_name}</li>
        <li><strong>Environment:</strong> {data.system.environment}</li>
        <li><strong>App version:</strong> {data.system.app_version}</li>
        <li><strong>Database:</strong> <AdminStatusBadge label={data.system.database_connectivity_status} tone={data.system.database_connectivity_status === 'connected' ? 'success' : 'warning'} /></li>
        <li><strong>Admin API:</strong> <AdminStatusBadge label={data.system.admin_configured ? 'Configured' : 'Disabled'} tone={data.system.admin_configured ? 'success' : 'warning'} /></li>
      </ul>
      <form method="POST" action="?/runDiagnostics">
        <button class="admin-button" type="submit">Run live diagnostics</button>
      </form>
    </AdminSectionCard>
  {:else if data.systemRestricted}
    <AdminSectionCard eyebrow="System" title="Root-only diagnostics hidden" description="Delegated roles can verify their own role context here. Full system diagnostics remain superadmin-only until the core admin backend is fully capability-based.">
      <form method="POST" action="?/runDiagnostics">
        <button class="admin-button" type="submit">Run role diagnostics</button>
      </form>
    </AdminSectionCard>
  {/if}
</div>

<AdminSectionCard eyebrow="Allowed operations" title="Role-based action map" description="Unavailable actions are intentionally disabled instead of linking to pages that this role cannot use.">
  <div class="admin-status-grid">
    {#each operations as operation}
      {@const allowed = can(operation.capability) || (operation.fallback ? can(operation.fallback) : false)}
      <article class="admin-status-card">
        <div class="admin-status-card__top">
          <strong>{operation.title}</strong>
          <AdminStatusBadge label={allowed ? 'Available' : 'Locked'} tone={allowed ? 'success' : 'neutral'} />
        </div>
        <p>{operation.detail}</p>
        <p class="admin-muted">Required: {operation.capability}{operation.fallback ? ` or ${operation.fallback}` : ''}</p>
        {#if allowed}
          <a class="admin-button--secondary" href={operation.href}>Open</a>
        {/if}
      </article>
    {/each}
  </div>
</AdminSectionCard>

<AdminSectionCard eyebrow="Capability catalog" title="Backend role catalog" description="Read-only policy matrix returned by the Admin Team API.">
  <div class="admin-status-grid">
    {#each data.roles as role}
      <article class="admin-status-card">
        <div class="admin-status-card__top">
          <strong>{role.role}</strong>
          <AdminStatusBadge label={role.capabilities.length + ' capabilities'} tone={role.role === actor?.role ? 'success' : 'neutral'} />
        </div>
        <p>{role.description}</p>
        <p class="admin-muted">{role.capabilities.join(', ')}</p>
      </article>
    {/each}
  </div>
</AdminSectionCard>

{#if data.system}
  <AdminSectionCard eyebrow="Safety" title="Runtime safety flags" description="Boolean states only; no secret values or private endpoint configuration are rendered.">
    <div class="admin-status-grid">
      <article class="admin-status-card"><div class="admin-status-card__top"><strong>No wallet auto-connect</strong><AdminStatusBadge label={label(data.system.safety_checklist.no_wallet_autoconnect)} tone={booleanTone(data.system.safety_checklist.no_wallet_autoconnect)} /></div></article>
      <article class="admin-status-card"><div class="admin-status-card__top"><strong>No signature prompt</strong><AdminStatusBadge label={label(data.system.safety_checklist.no_signature_prompt)} tone={booleanTone(data.system.safety_checklist.no_signature_prompt)} /></div></article>
      <article class="admin-status-card"><div class="admin-status-card__top"><strong>No private key handling</strong><AdminStatusBadge label={label(data.system.safety_checklist.no_private_key_handling)} tone={booleanTone(data.system.safety_checklist.no_private_key_handling)} /></div></article>
      <article class="admin-status-card"><div class="admin-status-card__top"><strong>Onchain writes</strong><AdminStatusBadge label={label(data.system.feature_flags.onchain_writes)} tone={data.system.feature_flags.onchain_writes ? 'warning' : 'success'} /></div></article>
    </div>
  </AdminSectionCard>
{/if}
