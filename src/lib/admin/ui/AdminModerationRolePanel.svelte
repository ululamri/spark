<script lang="ts">
  import type { AdminRoleProfile } from '$lib/admin/admin-role-matrix';
  import AdminSectionCard from './AdminSectionCard.svelte';

  let { profile }: { profile: AdminRoleProfile } = $props();
</script>

<AdminSectionCard eyebrow={profile.eyebrow} title={profile.title} description={profile.description}>
  <div class="admin-card-grid admin-card-grid--compact">
    <div>
      <p class="admin-muted">Primary surface</p>
      <p><strong>{profile.primarySurface}</strong></p>
      <p class="admin-muted">Capability state</p>
      <ul class="admin-checklist">
        <li>ML tools: {profile.canManageMl ? 'enabled' : 'read-only'}</li>
        <li>Bulk tools: {profile.canRunBulk ? 'enabled' : 'read-only'}</li>
        <li>Report handling: {profile.canReviewReports ? 'enabled' : 'review-focused'}</li>
      </ul>
    </div>
    <div>
      <p class="admin-muted">Allowed work</p>
      <ul class="admin-checklist">
        {#each profile.allowedWork as item}
          <li>{item}</li>
        {/each}
      </ul>
    </div>
    <div>
      <p class="admin-muted">Blocked or out-of-scope work</p>
      <ul class="admin-checklist">
        {#each profile.blockedWork as item}
          <li>{item}</li>
        {/each}
      </ul>
    </div>
  </div>
</AdminSectionCard>
