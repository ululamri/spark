<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatCard from '$lib/admin/ui/AdminStatCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';

  let { data } = $props();

  const event = $derived(data.event);
  const capabilities = $derived(event?.capabilities ?? []);
  const metadataJson = $derived(JSON.stringify(event?.metadata ?? {}, null, 2));
  const metrics = $derived(event ? [
    { id: 'capabilities', label: 'Capabilities', value: capabilities.length, detail: 'Capabilities present on the actor context when the event was written.', state: 'available' as const },
    { id: 'metadata-size', label: 'Metadata chars', value: metadataJson.length, detail: 'Rendered JSON metadata size.', state: 'available' as const },
    { id: 'has-target', label: 'Has target', value: event.target_id ? 1 : 0, detail: 'Whether the audit row points at a target record.', state: 'available' as const },
    { id: 'has-user', label: 'Has target user', value: event.target_user_id ? 1 : 0, detail: 'Whether the audit row points at a user target.', state: 'available' as const }
  ] : []);

  function tone(actorKind: string) {
    if (actorKind === 'super_admin_token') return 'warning' as const;
    if (actorKind === 'system') return 'neutral' as const;
    return 'success' as const;
  }

  function shortId(value: string | null | undefined) {
    return value ? value.slice(0, 8) : '—';
  }
</script>

<svelte:head><title>Audit event detail - Karyra Spark Admin</title></svelte:head>

<AdminHeader
  title="Audit event detail"
  description="Read-only detail view for one append-only admin audit event."
>
  {#snippet actions()}
    <a class="admin-button--secondary" href="/admin/audit">Back to audit log</a>
  {/snippet}
</AdminHeader>

{#if data.apiError}
  <AdminEmptyState state="error" title="Audit event unavailable" detail={data.apiError} />
{:else if event}
  <div class="admin-stat-grid">
    {#each metrics as metric}
      <AdminStatCard {...metric} />
    {/each}
  </div>

  <AdminSectionCard eyebrow="Event" title={event.action} description={event.summary || 'No event summary recorded.'}>
    <div class="admin-status-grid">
      <div class="admin-status-card">
        <div class="admin-status-card__top"><strong>Actor</strong><AdminStatusBadge label={event.actor_kind} tone={tone(event.actor_kind)} /></div>
        <p>{event.actor_user_id ? event.actor_user_id : 'No actor user id. Usually this means legacy root token or system context.'}</p>
      </div>
      <div class="admin-status-card">
        <div class="admin-status-card__top"><strong>Target</strong><AdminStatusBadge label={event.target_type} tone="neutral" /></div>
        <p>Target id: {event.target_id || 'none'}. Target user: {event.target_user_id || 'none'}.</p>
      </div>
      <div class="admin-status-card">
        <div class="admin-status-card__top"><strong>Created</strong><AdminStatusBadge label="append-only" tone="success" /></div>
        <p>{event.created_at}</p>
      </div>
      <div class="admin-status-card">
        <div class="admin-status-card__top"><strong>Event id</strong><AdminStatusBadge label={shortId(event.id)} tone="neutral" /></div>
        <p>{event.id}</p>
      </div>
    </div>
  </AdminSectionCard>

  <AdminSectionCard eyebrow="Capabilities" title="Actor capabilities" description="Capabilities captured at write time for audit context.">
    {#if capabilities.length}
      <div class="admin-status-grid">
        {#each capabilities as capability}
          <div class="admin-status-card"><strong>{capability}</strong></div>
        {/each}
      </div>
    {:else}
      <AdminEmptyState title="No capabilities recorded" detail="This audit event has an empty capabilities array." />
    {/if}
  </AdminSectionCard>

  <AdminSectionCard eyebrow="Metadata" title="Raw event metadata" description="Full JSON metadata from the audit event. This view is read-only.">
    <pre class="admin-code-block">{metadataJson}</pre>
  </AdminSectionCard>
{/if}
