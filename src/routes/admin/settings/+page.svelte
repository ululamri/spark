<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';

  let { data } = $props();

  function booleanTone(value: boolean) {
    return value ? 'success' as const : 'neutral' as const;
  }

  function label(value: boolean) {
    return value ? 'Enabled' : 'Disabled';
  }
</script>

<svelte:head><title>System settings - Karyra Spark Admin</title></svelte:head>
<AdminHeader title="Settings and system" description="Safe runtime summary. Private environment values, tokens, database URLs, and RPC URLs are never displayed." />

{#if data.apiError}
  <AdminEmptyState state="error" title="System data could not be loaded" detail={data.apiError} />
{:else if data.system?.data_source === 'not_available'}
  <AdminEmptyState title="System data is not available" detail="The backend reported data_source: not_available. No local configuration fallback is shown." />
{:else if data.system}
  <div class="admin-card-grid">
    <AdminSectionCard eyebrow="Environment" title="Deployment summary" description="Only safe status values returned by the protected Admin API are shown.">
      <ul class="admin-list">
        <li><strong>Service:</strong> {data.system.service_name}</li>
        <li><strong>Environment:</strong> {data.system.environment}</li>
        <li><strong>App version:</strong> {data.system.app_version}</li>
        <li><strong>Database:</strong> <AdminStatusBadge label={data.system.database_connectivity_status} tone={data.system.database_connectivity_status === 'connected' ? 'success' : 'warning'} /></li>
        <li><strong>Admin API:</strong> <AdminStatusBadge label={data.system.admin_configured ? 'Configured' : 'Disabled'} tone={data.system.admin_configured ? 'success' : 'warning'} /></li>
      </ul>
    </AdminSectionCard>

    <AdminSectionCard eyebrow="Safety" title="Admin safety checklist" description="Backend-reported safety invariants for this deployment.">
      <ul class="admin-list">
        <li><strong>No wallet auto-connect:</strong> <AdminStatusBadge label={label(data.system.safety_checklist.no_wallet_autoconnect)} tone={booleanTone(data.system.safety_checklist.no_wallet_autoconnect)} /></li>
        <li><strong>No signature prompt:</strong> <AdminStatusBadge label={label(data.system.safety_checklist.no_signature_prompt)} tone={booleanTone(data.system.safety_checklist.no_signature_prompt)} /></li>
        <li><strong>No transaction prompt:</strong> <AdminStatusBadge label={label(data.system.safety_checklist.no_transaction_prompt)} tone={booleanTone(data.system.safety_checklist.no_transaction_prompt)} /></li>
        <li><strong>No private key handling:</strong> <AdminStatusBadge label={label(data.system.safety_checklist.no_private_key_handling)} tone={booleanTone(data.system.safety_checklist.no_private_key_handling)} /></li>
        <li><strong>No seed phrase handling:</strong> <AdminStatusBadge label={label(data.system.safety_checklist.no_seed_phrase_handling)} tone={booleanTone(data.system.safety_checklist.no_seed_phrase_handling)} /></li>
      </ul>
    </AdminSectionCard>
  </div>

  <AdminSectionCard eyebrow="Feature flags" title="Runtime feature flags" description="Boolean states only; no secret values or private endpoint configuration.">
    <div class="admin-status-grid">
      <article class="admin-status-card"><div class="admin-status-card__top"><strong>Admin API v1 read-only</strong><AdminStatusBadge label={label(data.system.feature_flags.admin_api_v1_read_only)} tone={booleanTone(data.system.feature_flags.admin_api_v1_read_only)} /></div></article>
      <article class="admin-status-card"><div class="admin-status-card__top"><strong>Starknet reader</strong><AdminStatusBadge label={label(data.system.feature_flags.starknet_reader)} tone={booleanTone(data.system.feature_flags.starknet_reader)} /></div></article>
      <article class="admin-status-card"><div class="admin-status-card__top"><strong>Onchain writes</strong><AdminStatusBadge label={label(data.system.feature_flags.onchain_writes)} tone={data.system.feature_flags.onchain_writes ? 'warning' : 'success'} /></div></article>
    </div>
  </AdminSectionCard>
{/if}
