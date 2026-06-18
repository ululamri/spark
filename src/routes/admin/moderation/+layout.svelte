<script lang="ts">
  import { adminRoleProfile } from '$lib/admin/admin-role-matrix';
  import AdminModerationRolePanel from '$lib/admin/ui/AdminModerationRolePanel.svelte';

  let { children, data } = $props();

  const actor = $derived(data.adminActor);
  const roleProfile = $derived(adminRoleProfile(actor?.role, actor?.capabilities ?? []));
</script>

<AdminModerationRolePanel profile={roleProfile} />

{@render children()}
