<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatCard from '$lib/admin/ui/AdminStatCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data } = $props();
  const metrics = $derived(
    data.overview
      ? [
          { id: 'learners', label: 'Learners / users', value: data.overview.total_learners, detail: 'Registered learner accounts.', state: 'available' as const },
          { id: 'lessons', label: 'Observed lessons', value: data.overview.total_lessons, detail: 'Distinct lesson IDs in progress records.', state: 'available' as const },
          { id: 'lesson-completions', label: 'Lesson completions', value: data.overview.total_lesson_completions, detail: 'Completed lesson progress records.', state: 'available' as const },
          { id: 'lab-activity', label: 'Lab activity', value: data.overview.total_lab_events, detail: 'Attempts, checkpoints, and Lab exam events.', state: 'available' as const },
          { id: 'passports', label: 'Passport records', value: data.overview.total_passports, detail: 'Stored Passport credentials.', state: 'available' as const },
          { id: 'proofs', label: 'Proof / evidence records', value: data.overview.total_proof_records, detail: 'Backend Proof Ledger records.', state: 'available' as const },
          { id: 'participation', label: 'Participation records', value: data.overview.total_participation_records, detail: 'Workshop registration records.', state: 'available' as const }
        ]
      : []
  );

  function statusTone(status: string) {
    if (['available', 'connected', 'operational', 'healthy'].includes(status.toLowerCase())) return 'success' as const;
    if (['unavailable', 'error', 'disconnected', 'failed'].includes(status.toLowerCase())) return 'danger' as const;
    return 'neutral' as const;
  }
</script>

<svelte:head><title>Admin overview - Karyra Spark</title></svelte:head>

<AdminHeader title="Ecosystem overview" description="Operational visibility for Spark learning, practice, Passport, participation, and Starknet readiness surfaces.">
  {#snippet actions()}<a class="admin-button--secondary" href="/" target="_blank" rel="noreferrer">Open public Spark</a>{/snippet}
</AdminHeader>

{#if data.apiError}
  <AdminEmptyState state="error" title="Admin API is unavailable" detail={data.apiError} />
{:else if data.overview?.data_source === 'not_available'}
  <AdminEmptyState title="Overview data is not available" detail="The backend reported data_source: not_available. No fallback metrics are shown." />
{:else if data.overview}
  <div class="admin-stat-grid">
    {#each metrics as metric}<AdminStatCard {...metric} />{/each}
  </div>

  <div class="admin-card-grid">
    <AdminSectionCard eyebrow="Runtime" title="System health" description="Safe status fields returned by the protected Admin API.">
      <div class="admin-status-card">
        <div class="admin-status-card__top"><strong>Spark API</strong><AdminStatusBadge label={data.overview.system_health.service} tone={statusTone(data.overview.system_health.service)} /></div>
        <p>Database: {data.overview.system_health.database}.</p>
      </div>
    </AdminSectionCard>
    <AdminSectionCard eyebrow="Starknet" title="Network status" description="No private RPC values are returned to the browser.">
      <div class="admin-status-card">
        <div class="admin-status-card__top"><strong>Read-only integration</strong><AdminStatusBadge label={data.overview.starknet_status.status} tone={statusTone(data.overview.starknet_status.status)} /></div>
        <p>{data.overview.starknet_status.configured_networks.length ? data.overview.starknet_status.configured_networks.join(', ') : 'No configured networks reported.'}</p>
      </div>
    </AdminSectionCard>
  </div>

  <AdminSectionCard eyebrow="Activity" title="Recent activity" description="Latest protected Proof Ledger events returned by the backend.">
    {#if data.overview.recent_activity.length}
      <AdminTable caption="Recent admin activity" columns={['Activity', 'Learner', 'Source', 'Status', 'Timestamp']}>
        {#each data.overview.recent_activity as activity}
          <tr><td><strong>{activity.activity_title}</strong><br /><span class="admin-muted">{activity.activity_type}</span></td><td><a href={'/admin/learners/' + activity.learner_id}>{activity.learner_id}</a></td><td>{activity.source || 'System'}</td><td><AdminStatusBadge label={activity.status} tone={statusTone(activity.status)} /></td><td>{activity.timestamp}</td></tr>
        {/each}
      </AdminTable>
    {:else}
      <AdminEmptyState title="No recent activity" detail="The Admin API returned an empty recent activity collection." />
    {/if}
  </AdminSectionCard>
{/if}
