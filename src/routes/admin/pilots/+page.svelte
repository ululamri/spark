<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data } = $props();
</script>

<svelte:head><title>Community pilot - Karyra Spark Admin</title></svelte:head>
<AdminHeader title="Community pilot" description="Private operational tracking for Seed Grant and local pilot cohorts, not a public social feed." />

{#if data.apiError}
  <AdminEmptyState state="error" title="Community pilot data could not be loaded" detail={data.apiError} />
{:else if data.pilot?.data_source === 'not_available'}
  <AdminEmptyState title="Community pilot data is not available" detail="The backend reported data_source: not_available. No session templates or synthetic counts are shown." />
{:else if data.pilot}
  <div class="admin-card-grid">
    <AdminSectionCard eyebrow="Cohort overview" title="Pilot participation" description="Protected aggregate returned by the Admin API.">
      <div class="admin-status-card"><div class="admin-status-card__top"><strong>Participant count</strong><AdminStatusBadge label={data.pilot.pilot_status} tone="info" /></div><p>{data.pilot.participant_count} participant records reported.</p></div>
    </AdminSectionCard>
    <AdminSectionCard eyebrow="Evidence safety" title="Privacy reminder" description="Guidance supplied by the backend for this operational dataset.">
      <div class="admin-note">{data.pilot.privacy_reminder || 'Use aggregate or pseudonymous evidence and avoid unnecessary personal details.'}</div>
    </AdminSectionCard>
  </div>

  <AdminSectionCard eyebrow="Cohorts" title="Pilot cohorts" description="Cohort identifiers and current backend status.">
    {#if data.pilot.cohorts.length}<AdminTable caption="Community pilot cohorts" columns={['Cohort', 'Status']}>{#each data.pilot.cohorts as cohort}<tr><td><span class="admin-code">{cohort.id}</span></td><td><AdminStatusBadge label={cohort.status} tone="info" /></td></tr>{/each}</AdminTable>{:else}<AdminEmptyState title="No pilot cohorts" detail="The Admin API returned an empty cohort collection." />{/if}
  </AdminSectionCard>

  <AdminSectionCard eyebrow="Sessions" title="Pilot sessions" description="Session identifiers and current backend status.">
    {#if data.pilot.sessions.length}<AdminTable caption="Community pilot sessions" columns={['Session', 'Status']}>{#each data.pilot.sessions as session}<tr><td><span class="admin-code">{session.id}</span></td><td><AdminStatusBadge label={session.status} tone="info" /></td></tr>{/each}</AdminTable>{:else}<AdminEmptyState title="No pilot sessions" detail="The Admin API returned an empty session collection." />{/if}
  </AdminSectionCard>

  <AdminSectionCard eyebrow="Notes" title="Facilitator notes" description="Read-only operational notes returned by the protected API.">
    {#if data.pilot.notes}<div class="admin-note">{data.pilot.notes}</div>{:else}<AdminEmptyState title="No pilot notes" detail="The backend returned no pilot notes." />{/if}
  </AdminSectionCard>
{/if}
