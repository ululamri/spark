<script lang="ts">
  import { page } from '$app/state';
  import '$lib/admin/admin.css';
  import AdminLayout from '$lib/admin/ui/AdminLayout.svelte';

  let { children, data } = $props();

  const authSurfacePaths = new Set(['/admin/login', '/admin/superadmin/login', '/admin/onboarding', '/admin/reset', '/admin/recovery']);
</script>

<svelte:head>
  <meta name="robots" content="noindex, nofollow, noarchive" />
</svelte:head>

{#if authSurfacePaths.has(page.url.pathname) || !data.adminAuthenticated}
  {@render children()}
{:else}
  <AdminLayout actor={data.adminActor}>
    {@render children()}
  </AdminLayout>
{/if}
