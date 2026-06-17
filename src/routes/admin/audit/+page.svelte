<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatCard from '$lib/admin/ui/AdminStatCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data } = $props();

  const events = $derived(data.events?.items ?? []);
  const filters = $derived(data.filters);
  const moderationCount = $derived(events.filter((event) => event.action.includes('moderation')).length);
  const rootTokenCount = $derived(events.filter((event) => event.actor_kind === 'super_admin_token').length);
  const uniqueActions = $derived(new Set(events.map((event) => event.action)).size);

  const metrics = $derived([
    { id: 'events', label: 'Loaded events', value: events.length, detail: 'Audit events loaded in this window.', state: 'available' as const },
    { id: 'moderation', label: 'Moderation events', value: moderationCount, detail: 'Events with moderation action names.', state: 'available' as const },
    { id: 'root-token', label: 'Root-token events', value: rootTokenCount, detail: 'Events performed by the legacy env superadmin token.', state: 'available' as const },
    { id: 'actions', label: 'Unique actions', value: uniqueActions, detail: 'Distinct action names in the loaded window.', state: 'available' as const }
  ]);

  function tone(actorKind: string) {
    if (actorKind === 'super_admin_token') return 'warning' as const;
    if (actorKind === 'system') return 'neutral' as const;
    return 'success' as const;
  }

  function shortId(value: string | null | undefined) {
    return value ? value.slice(0, 8) : '—';
  }

  function metadataPreview(value: Record<string, unknown>) {
    const text = JSON.stringify(value || {});
    return text.length > 180 ? text.slice(0, 180) + '…' : text;
  }
</script>

<svelte:head><title>Audit log - Karyra Spark Admin</title></svelte:head>

<AdminHeader
  title="Audit log"
  description="Read-only operational evidence for admin, moderation, CMS, role, and system actions."
>
  {#snippet actions()}
    <a class="admin-button--secondary" href="/admin/moderation">Open moderation</a>
  {/snippet}
</AdminHeader>

{#if data.apiError}
  <AdminEmptyState state="error" title="Audit API is unavailable" detail={data.apiError} />
{/if}

<div class="admin-stat-grid">
  {#each metrics as metric}
    <AdminStatCard {...metric} />
  {/each}
</div>

<AdminSectionCard eyebrow="Filters" title="Read audit trail" description="Filters are URL-based and read-only. They never mutate audit rows.">
  <form class="admin-moderation-form" method="GET" action="/admin/audit">
    <div class="admin-filter-row">
      <label>
        Actor kind
        <input name="actor_kind" value={filters.actorKind === 'all' ? '' : filters.actorKind} placeholder="all, super_admin_token, admin, moderator, system" />
      </label>
      <label>
        Action
        <input name="action" value={filters.action === 'all' ? '' : filters.action} placeholder="ml_moderation_signal_create" />
      </label>
      <label>
        Target type
        <input name="target_type" value={filters.targetType === 'all' ? '' : filters.targetType} placeholder="post, comment, social_moderation_ml_signal" />
      </label>
      <button class="admin-button" type="submit">Apply filters</button>
      <a class="admin-button--secondary" href="/admin/audit">Reset</a>
    </div>
  </form>
</AdminSectionCard>

<AdminSectionCard eyebrow="Events" title="Latest audit events" description="Append-only audit rows from the backend admin audit table. Open an event to inspect full metadata and capabilities.">
  {#if events.length}
    <AdminTable caption="Admin audit events" columns={['Event', 'Actor', 'Target', 'Summary', 'Metadata']}>
      {#each events as event}
        <tr>
          <td>
            <a href={'/admin/audit/events/' + event.id}><strong>{event.action}</strong></a><br />
            <span class="admin-muted">{shortId(event.id)} · {event.created_at}</span>
          </td>
          <td>
            <AdminStatusBadge label={event.actor_kind} tone={tone(event.actor_kind)} />
            <div class="admin-muted">{event.actor_user_id ? shortId(event.actor_user_id) : 'no user id'}</div>
          </td>
          <td>
            <span class="admin-code">{event.target_type}</span><br />
            <span class="admin-muted">target {shortId(event.target_id)} · user {shortId(event.target_user_id)}</span>
          </td>
          <td>
            {event.summary || '—'}
            {#if event.capabilities.length}
              <div class="admin-muted">capabilities: {event.capabilities.slice(0, 5).join(', ')}{event.capabilities.length > 5 ? '…' : ''}</div>
            {/if}
          </td>
          <td><span class="admin-muted">{metadataPreview(event.metadata)}</span></td>
        </tr>
      {/each}
    </AdminTable>
  {:else if !data.apiError}
    <AdminEmptyState title="No audit events match filters" detail="Adjust the actor, action, or target type filters." />
  {/if}
</AdminSectionCard>
