<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data } = $props();
  let query = $state('');
  let statusFilter = $state('all');
  const records = $derived(data.passports?.items ?? []);
  const filteredRecords = $derived(records.filter((record) => (!query.trim() || record.learner_id.toLowerCase().includes(query.trim().toLowerCase())) && (statusFilter === 'all' || record.status === statusFilter)));
</script>

<svelte:head><title>Passport - Karyra Spark Admin</title></svelte:head>
<AdminHeader title="Readiness Passport" description="Review protected offchain Passport records without claiming an onchain credential or badge.">
  {#snippet actions()}<a class="admin-button--secondary" href="/passport" target="_blank" rel="noreferrer">Preview Passport</a>{/snippet}
</AdminHeader>
<div class="admin-card-grid">
  <AdminSectionCard eyebrow="Derivation" title="How Passport status is derived" description="The model combines learning, Lab, and participation evidence."><ol class="admin-derivation"><li>Core lesson evidence establishes proof of learning.</li><li>Lab checkpoints establish proof of practice and safety.</li><li>Workshop signals may add community verification.</li><li>Evidence is summarized into offchain readiness eligibility.</li></ol></AdminSectionCard>
  <AdminSectionCard eyebrow="Chain boundary" title="Credential status" description="The API reports stored anchor status; it does not prove an onchain attestation."><div class="admin-note">No admin action connects a wallet, requests a signature, or performs an onchain write.</div></AdminSectionCard>
</div>
<AdminSectionCard eyebrow="Protected records" title="Passport records and Evidence Trail" description="Records returned by the protected Admin API.">
  {#if data.apiError}
    <AdminEmptyState state="error" title="Passport data could not be loaded" detail={data.apiError} />
  {:else if data.passports?.data_source === 'not_available'}
    <AdminEmptyState title="Passport data is not available" detail="The backend reported data_source: not_available. No fallback records are shown." />
  {:else}
    <div class="admin-filter-row"><label>Learner ID<input bind:value={query} type="search" placeholder="Filter learner records" /></label><label>Issue status<select bind:value={statusFilter}><option value="all">All statuses</option><option value="draft">Draft</option><option value="eligible">Eligible</option><option value="issued_offchain">Issued offchain</option><option value="revoked">Revoked</option></select></label></div>
    {#if filteredRecords.length}<AdminTable caption="Passport records" columns={['Passport', 'Learner', 'Level', 'Status', 'Evidence', 'Attestation', 'Updated']}>{#each filteredRecords as record}<tr><td>{record.id}</td><td><a href={'/admin/learners/' + record.learner_id}>{record.learner_id}</a></td><td>{record.readiness_level}</td><td><AdminStatusBadge label={record.status} tone="info" /></td><td>{record.evidence_count}</td><td>{record.starknet_attestation_status}</td><td>{record.updated_at}</td></tr>{/each}</AdminTable>{:else}<AdminEmptyState title="No Passport records" detail="The backend collection is empty or no records match the current filters." />{/if}
  {/if}
</AdminSectionCard>
