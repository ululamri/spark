<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data } = $props();
  let sourceFilter = $state('all');
  let statusFilter = $state('all');
  const records = $derived(data.proofLedger?.items ?? []);
  const filteredRecords = $derived(records.filter((record) => (sourceFilter === 'all' || record.source === sourceFilter || record.activity_type === sourceFilter) && (statusFilter === 'all' || record.status === statusFilter)));

  function statusTone(status: string) {
    if (['verified', 'complete', 'completed', 'accepted'].includes(status.toLowerCase())) return 'success' as const;
    if (['rejected', 'failed', 'revoked'].includes(status.toLowerCase())) return 'danger' as const;
    return 'warning' as const;
  }
</script>

<svelte:head><title>Proof Ledger - Karyra Spark Admin</title></svelte:head>
<AdminHeader title="Proof Ledger and participation" description="Read-only review of learning, Lab, workshop, cohort, system, and facilitator evidence returned by the Admin API." />

<AdminSectionCard eyebrow="Verification queue" title="Participation and evidence records" description="Admin API v1 is read-only; no verification controls are exposed in the browser.">
  {#if data.apiError}
    <AdminEmptyState state="error" title="Proof Ledger data could not be loaded" detail={data.apiError} />
  {:else if data.proofLedger?.data_source === 'not_available'}
    <AdminEmptyState title="Proof Ledger data is not available" detail="The backend reported data_source: not_available. No fallback evidence records are shown." />
  {:else}
    <div class="admin-filter-row">
      <label>Source<select bind:value={sourceFilter}><option value="all">All sources</option><option value="system">System</option><option value="lesson">Lesson</option><option value="lab">Lab</option><option value="workshop">Workshop</option><option value="cohort">Cohort</option><option value="facilitator">Facilitator</option></select></label>
      <label>Status<select bind:value={statusFilter}><option value="all">All statuses</option><option value="pending">Pending</option><option value="verified">Verified</option><option value="rejected">Rejected</option></select></label>
    </div>
    {#if filteredRecords.length}
      <AdminTable caption="Proof Ledger records" columns={['Record', 'Learner', 'Activity', 'Source', 'Status', 'Timestamp', 'Attestation']}>
        {#each filteredRecords as record}<tr><td>{record.id}</td><td><a href={'/admin/learners/' + record.learner_id}>{record.learner_id}</a></td><td><strong>{record.activity_title}</strong><br /><span class="admin-muted">{record.activity_type}</span></td><td>{record.source || record.issuer_type}</td><td><AdminStatusBadge label={record.status} tone={statusTone(record.status)} /></td><td>{record.timestamp}</td><td>{record.starknet_attestation_status}</td></tr>{/each}
      </AdminTable>
    {:else}<AdminEmptyState title="No Proof Ledger records" detail="The backend collection is empty or no records match the current filters." />{/if}
  {/if}
</AdminSectionCard>
