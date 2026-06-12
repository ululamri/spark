<script lang="ts">
  import { adminRoadmapModules } from '$lib/admin/admin-data';
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';

  let { data } = $props();

  function serviceTone(status: string) {
    if (['available', 'connected', 'ready', 'operational'].includes(status.toLowerCase())) return 'success' as const;
    if (['unavailable', 'error', 'failed'].includes(status.toLowerCase())) return 'danger' as const;
    return 'neutral' as const;
  }

  function roadmapTone(status: string) {
    if (status === 'available') return 'success' as const;
    if (status === 'planned') return 'info' as const;
    return 'neutral' as const;
  }
</script>

<svelte:head><title>Starknet and Hub - Karyra Spark Admin</title></svelte:head>
<AdminHeader title="Starknet and Hub" description="Read-only network visibility, Hub route configuration, and module roadmap status.">
  {#snippet actions()}<a class="admin-button--secondary" href={data.hubUrl} target="_blank" rel="noreferrer">Open Hub</a>{/snippet}
</AdminHeader>

{#if data.apiError}
  <AdminEmptyState state="error" title="Starknet status could not be loaded" detail={data.apiError} />
{:else if data.starknet?.data_source === 'not_available'}
  <AdminEmptyState title="Starknet status is not available" detail="The backend reported data_source: not_available. No local RPC fallback is shown." />
{:else if data.starknet}
  <div class="admin-status-grid">
    <article class="admin-status-card"><div class="admin-status-card__top"><strong>Hub route</strong><AdminStatusBadge label="Configured" tone="success" /></div><p>The safe public Hub route is <span class="admin-code">{data.hubUrl}</span>.</p></article>
    <article class="admin-status-card"><div class="admin-status-card__top"><strong>Starknet RPC</strong><AdminStatusBadge label={data.starknet.rpc_read_only_status} tone={serviceTone(data.starknet.rpc_read_only_status)} /></div><p>{data.starknet.configured_networks.length ? data.starknet.configured_networks.join(', ') : 'No configured networks reported.'}</p></article>
    <article class="admin-status-card"><div class="admin-status-card__top"><strong>Address / Account Reader</strong><AdminStatusBadge label={data.starknet.address_account_reader_status} tone={serviceTone(data.starknet.address_account_reader_status)} /></div><p>Last checked: {data.starknet.last_checked_at || 'Not reported'}.</p></article>
    <article class="admin-status-card"><div class="admin-status-card__top"><strong>Mainnet readiness</strong><AdminStatusBadge label={data.starknet.mainnet_readiness ? 'Ready' : 'Not ready'} tone={data.starknet.mainnet_readiness ? 'success' : 'neutral'} /></div><p>Overall status: {data.starknet.status}.</p></article>
  </div>
{/if}

<AdminSectionCard eyebrow="Roadmap" title="Starknet readiness modules" description="Planned cards are status documentation only. They do not connect wallets or submit transactions.">
  <div class="admin-status-grid">
    {#each adminRoadmapModules as module}<article class="admin-roadmap-card"><div class="admin-roadmap-card__top"><strong>{module.title}</strong><AdminStatusBadge label={module.status} tone={roadmapTone(module.status)} /></div><p>{module.detail}</p></article>{/each}
  </div>
</AdminSectionCard>
