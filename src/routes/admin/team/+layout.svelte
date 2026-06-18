<script lang="ts">
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';

  let { children } = $props();
</script>

<div class="team-matrix-locked">
  <AdminSectionCard eyebrow="PASS 19D role matrix" title="Delegated role presets are backend-owned" description="Admin and moderator capabilities now come from the final backend matrix. This page no longer exposes mixed capability checkboxes for delegated grants.">
    <ul class="admin-checklist">
      <li>Admin operations: ML moderation, bulk moderation, reports, content safety, media review, and audit-read where assigned by backend.</li>
      <li>Moderator review: moderation read/action, reports, content read, and media review.</li>
      <li>Moderator grants do not include ML creation, bulk moderation, audit read, admin team management, or root settings.</li>
      <li>Superadmin remains the legacy root control and is not created as a user assignment here.</li>
    </ul>
  </AdminSectionCard>

  {@render children()}
</div>

<style>
  :global(.team-matrix-locked .admin-card-grid .admin-moderation-form > .admin-checkbox-row) {
    display: none;
  }
</style>
