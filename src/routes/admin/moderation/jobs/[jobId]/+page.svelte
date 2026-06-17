<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatCard from '$lib/admin/ui/AdminStatCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data } = $props();

  const detail = $derived(data.jobDetail);
  const job = $derived(detail?.job ?? null);
  const items = $derived(detail?.items ?? []);
  const failedItems = $derived(items.filter((item) => item.status === 'failed'));
  const appliedItems = $derived(items.filter((item) => item.status === 'applied'));
  const wouldApplyItems = $derived(items.filter((item) => item.status === 'would_apply'));
  const skippedItems = $derived(items.filter((item) => item.status === 'skipped'));

  const metrics = $derived(job ? [
    { id: 'total', label: 'Targets', value: job.total_count, detail: 'Targets submitted to this bulk moderation job.', state: 'available' as const },
    { id: 'would-apply', label: 'Would apply', value: job.would_apply_count, detail: 'Targets validated in dry-run mode.', state: 'available' as const },
    { id: 'applied', label: 'Applied', value: job.applied_count, detail: 'Targets that received a live moderation action.', state: 'available' as const },
    { id: 'failed', label: 'Failed', value: job.failed_count, detail: 'Targets that could not be processed.', state: 'available' as const }
  ] : []);

  function tone(status: string) {
    if (['completed', 'dry_run', 'applied', 'would_apply', 'reviewed', 'published'].includes(status)) return 'success' as const;
    if (['running', 'partial_failed', 'skipped', 'hidden'].includes(status)) return 'warning' as const;
    if (['failed', 'removed', 'deleted'].includes(status)) return 'danger' as const;
    return 'neutral' as const;
  }

  function shortId(value: string | null | undefined) {
    return value ? value.slice(0, 8) : '—';
  }

  function metadataText(value: Record<string, unknown> | null | undefined) {
    if (!value || !Object.keys(value).length) return '—';
    return JSON.stringify(value);
  }
</script>

<svelte:head><title>Moderation job detail - Karyra Spark Admin</title></svelte:head>

<AdminHeader
  title="Moderation job detail"
  description="Read-only detail view for one persisted bulk moderation operation."
>
  {#snippet actions()}
    <a class="admin-button--secondary" href="/admin/moderation">Back to moderation</a>
  {/snippet}
</AdminHeader>

{#if data.apiError}
  <AdminEmptyState state="error" title="Bulk moderation job unavailable" detail={data.apiError} />
{:else if job}
  <div class="admin-stat-grid">
    {#each metrics as metric}
      <AdminStatCard {...metric} />
    {/each}
  </div>

  <AdminSectionCard eyebrow="Job" title={shortId(job.id)} description="Persisted operation metadata from the backend bulk moderation engine.">
    <div class="admin-status-grid">
      <div class="admin-status-card">
        <div class="admin-status-card__top"><strong>Status</strong><AdminStatusBadge label={job.status} tone={tone(job.status)} /></div>
        <p>{job.dry_run ? 'Dry-run validation only. No content mutation was requested.' : 'Live moderation action job.'}</p>
      </div>
      <div class="admin-status-card">
        <div class="admin-status-card__top"><strong>Target</strong><AdminStatusBadge label={job.target_type} tone="neutral" /></div>
        <p>Action: {job.action}. Reason: {job.reason || 'No reason recorded'}.</p>
      </div>
      <div class="admin-status-card">
        <div class="admin-status-card__top"><strong>Actor</strong><AdminStatusBadge label={job.actor_kind} tone="info" /></div>
        <p>{job.actor_user_id ? job.actor_user_id : 'Legacy root token'}.</p>
      </div>
      <div class="admin-status-card">
        <div class="admin-status-card__top"><strong>Time</strong><AdminStatusBadge label={job.completed_at ? 'completed' : 'open'} tone={job.completed_at ? 'success' : 'warning'} /></div>
        <p>Created: {job.created_at}. Completed: {job.completed_at || 'not completed'}.</p>
      </div>
    </div>
  </AdminSectionCard>

  <AdminSectionCard eyebrow="Items" title="Per-target result" description="Each row is the persisted outcome for one target in the job.">
    {#if items.length}
      <AdminTable caption="Bulk moderation job items" columns={['Item', 'Target', 'Result', 'Message', 'Metadata']}>
        {#each items as item}
          <tr>
            <td><strong>{shortId(item.id)}</strong><br /><span class="admin-muted">{item.created_at}</span></td>
            <td>
              <span class="admin-code">{item.target_type}</span><br />
              <span class="admin-muted">{shortId(item.target_id)}</span>
            </td>
            <td>
              <AdminStatusBadge label={item.status} tone={tone(item.status)} />
              <div class="admin-muted">{item.action}</div>
              {#if item.action_id}<div class="admin-muted">action {shortId(item.action_id)}</div>{/if}
              {#if item.report_id}<div class="admin-muted">report {shortId(item.report_id)}</div>{/if}
            </td>
            <td>{item.message || '—'}</td>
            <td><span class="admin-muted">{metadataText(item.metadata)}</span></td>
          </tr>
        {/each}
      </AdminTable>
    {:else}
      <AdminEmptyState title="No item rows" detail="This job exists but has no persisted item results." />
    {/if}
  </AdminSectionCard>

  <AdminSectionCard eyebrow="Summary" title="Outcome buckets" description="Quick counts derived from persisted item rows.">
    <div class="admin-status-grid">
      <div class="admin-status-card"><strong>{wouldApplyItems.length}</strong><p>would_apply items</p></div>
      <div class="admin-status-card"><strong>{appliedItems.length}</strong><p>applied items</p></div>
      <div class="admin-status-card"><strong>{skippedItems.length}</strong><p>skipped items</p></div>
      <div class="admin-status-card"><strong>{failedItems.length}</strong><p>failed items</p></div>
    </div>
  </AdminSectionCard>
{/if}
