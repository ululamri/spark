<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';
  let { data } = $props();
</script>

<svelte:head><title>Practice Lab - Karyra Spark Admin</title></svelte:head>
<AdminHeader title="Safe Practice Lab" description="Observed Lab modules and recent attempt events from the protected Admin API.">{#snippet actions()}<a class="admin-button--secondary" href="/lab" target="_blank" rel="noreferrer">Preview Lab</a>{/snippet}</AdminHeader>
<AdminSectionCard eyebrow="Modules" title="Observed Lab modules" description="Frontend catalog metadata is used only to label backend-observed module IDs.">
  {#if data.apiError}<AdminEmptyState state="error" title="Lab data could not be loaded" detail={data.apiError} />
  {:else if data.dataSource === 'not_available'}<AdminEmptyState title="Lab data is not available" detail="The backend reported data_source: not_available. No fallback activity is shown." />
  {:else if data.modules.length}
    <AdminTable caption="Observed Safe Practice Lab modules" columns={['Module', 'Difficulty', 'Completions', 'Availability', 'Guardrail']}>
      {#each data.modules as item}<tr><td><strong>{item.name || item.catalog?.title || item.module_id}</strong><br /><span class="admin-code">{item.module_id}</span></td><td>{#if item.catalog}<AdminStatusBadge label={item.catalog.difficulty} tone={item.catalog.difficulty === 'safe' ? 'success' : 'info'} />{:else}<span class="admin-muted">Unknown</span>{/if}</td><td>{item.completion_count}</td><td><AdminStatusBadge label={item.status || (item.enabled === null ? 'Observed' : item.enabled ? 'Enabled' : 'Disabled')} tone={item.enabled === false ? 'warning' : 'neutral'} /></td><td>{item.catalog?.guardrail || 'No frontend catalog metadata.'}</td></tr>{/each}
    </AdminTable>
  {:else}<AdminEmptyState title="No observed Lab modules" detail="The backend returned no Lab attempt records." />{/if}
</AdminSectionCard>
<AdminSectionCard eyebrow="Activity" title="Recent Lab events" description="Latest protected Lab attempt events.">
  {#if data.recentEvents.length}<AdminTable caption="Recent Lab events" columns={['Module', 'Learner', 'Status', 'Timestamp']}>{#each data.recentEvents as event}<tr><td>{event.module_id}</td><td><a href={'/admin/learners/' + event.learner_id}>{event.learner_id}</a></td><td><AdminStatusBadge label={event.status} tone={event.status === 'passed' ? 'success' : 'info'} /></td><td>{event.timestamp}</td></tr>{/each}</AdminTable>{:else}<AdminEmptyState title="No recent Lab activity" detail="The Admin API returned an empty Lab event collection." />{/if}
</AdminSectionCard>
