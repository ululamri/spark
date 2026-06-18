<script lang="ts">
  import type { Snippet } from 'svelte';
  import AdminSidebar from './AdminSidebar.svelte';

  type AdminActor = {
    mode: 'superadmin' | 'delegated';
    role: string;
    actorKind: string;
    capabilities: string[];
  } | null;

  let { children, actor }: { children: Snippet; actor: AdminActor } = $props();
</script>

<div class="admin-root">
  <a class="admin-skip-link" href="#admin-content">Skip to admin content</a>
  <AdminSidebar {actor} />
  <main id="admin-content" class="admin-main">
    {@render children()}
  </main>
</div>
