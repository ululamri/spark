<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data } = $props();
  let query = $state('');
  let statusFilter = $state('all');
  const learners = $derived(data.learners?.items ?? []);
  const filteredLearners = $derived(
    learners.filter((learner) => {
      const needle = query.trim().toLowerCase();
      const status = learner.last_seen_at ? 'active' : 'unknown';
      const matchesQuery = !needle || [learner.id, learner.display_name, learner.email].filter(Boolean).some((value) => value?.toLowerCase().includes(needle));
      return matchesQuery && (statusFilter === 'all' || status === statusFilter);
    })
  );
</script>

<svelte:head><title>Learners - Karyra Spark Admin</title></svelte:head>
<AdminHeader title="Learners and users" description="Search learner identity and readiness records returned by the protected Admin API." />

<AdminSectionCard eyebrow="Protected data" title="Learner directory" description={data.learners ? `${data.learners.total} learner records reported by the backend.` : 'Protected learner records.'}>
  {#if data.apiError}
    <AdminEmptyState state="error" title="Learner data could not be loaded" detail={data.apiError} />
  {:else if data.learners?.data_source === 'not_available'}
    <AdminEmptyState title="Learner data is not available" detail="The backend reported data_source: not_available. No fallback learners are shown." />
  {:else}
    <div class="admin-filter-row">
      <label>Search name, email, or ID<input bind:value={query} type="search" placeholder="Search protected records" /></label>
      <label>Status<select bind:value={statusFilter}><option value="all">All statuses</option><option value="active">Active</option><option value="unknown">Unknown</option></select></label>
    </div>
    {#if filteredLearners.length}
      <AdminTable caption="Learner directory" columns={['Learner', 'Status', 'Lessons', 'Labs', 'Passport', 'Created', 'Action']}>
        {#each filteredLearners as learner}
          {@const status = learner.last_seen_at ? 'active' : 'unknown'}
          <tr><td><strong>{learner.display_name || 'Name withheld'}</strong><br /><span class="admin-muted">{learner.email || learner.id}</span></td><td><AdminStatusBadge label={status} tone={status === 'active' ? 'success' : 'neutral'} /></td><td>{learner.lesson_progress_summary.completed}/{learner.lesson_progress_summary.total}</td><td>{learner.lab_progress_summary.completed}/{learner.lab_progress_summary.total}</td><td>{learner.passport_status_summary.status || 'Not issued'}</td><td>{learner.created_at}</td><td><a href={'/admin/learners/' + learner.id}>View</a></td></tr>
        {/each}
      </AdminTable>
    {:else}
      <AdminEmptyState title="No learners match" detail="The protected learner collection is empty or no records match the current filters." />
    {/if}
  {/if}
</AdminSectionCard>
