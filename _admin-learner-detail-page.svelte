<script lang="ts">
  import { page } from '$app/state';
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';
  let { data } = $props();
</script>

<svelte:head><title>Learner detail - Karyra Spark Admin</title></svelte:head>
<AdminHeader title={data.learner?.profile.display_name || 'Learner detail'} description={'Protected detail for learner ID ' + page.params.id + '.'}>{#snippet actions()}<a class="admin-button--secondary" href="/admin/learners">Back to learners</a>{/snippet}</AdminHeader>

{#if data.apiError}
  <AdminEmptyState state="error" title="Learner detail could not be loaded" detail={data.apiError} />
{:else if data.learner?.data_source === 'not_available'}
  <AdminEmptyState title="Learner detail is not available" detail="The backend reported data_source: not_available. No fallback profile is shown." />
{:else if data.learner}
  <div class="admin-card-grid">
    <AdminSectionCard eyebrow="Profile" title="Protected account summary" description="Only fields supplied by the protected Admin API are displayed."><ul class="admin-list"><li><strong>Email:</strong> {data.learner.profile.email || 'Withheld'}</li><li><strong>Created:</strong> {data.learner.profile.created_at}</li><li><strong>Last seen:</strong> {data.learner.profile.last_seen_at || 'Not recorded'}</li><li><strong>Passport:</strong> {data.learner.passport_summary?.status || 'Not issued'}</li></ul></AdminSectionCard>
    <AdminSectionCard eyebrow="Evidence" title="Record totals" description="Related records returned for this learner."><ul class="admin-list"><li><strong>Lesson progress:</strong> {data.learner.lesson_progress.length}</li><li><strong>Lab attempts:</strong> {data.learner.lab_progress.length}</li><li><strong>Proof records:</strong> {data.learner.evidence_proof_entries.length}</li><li><strong>Participation:</strong> {data.learner.participation_records.length}</li></ul></AdminSectionCard>
  </div>
  <AdminSectionCard eyebrow="Learning" title="Lesson progress" description="Backend lesson progress records.">
    {#if data.learner.lesson_progress.length}<AdminTable caption="Lesson progress" columns={['Lesson', 'Level', 'Status', 'Progress', 'Updated']}>{#each data.learner.lesson_progress as item}<tr><td>{item.lesson_id}</td><td>{item.level}</td><td><AdminStatusBadge label={item.status} tone={item.status === 'completed' ? 'success' : 'info'} /></td><td>{item.progress_percent}%</td><td>{item.updated_at}</td></tr>{/each}</AdminTable>{:else}<AdminEmptyState title="No lesson progress" detail="The backend returned no lesson progress for this learner." />{/if}
  </AdminSectionCard>
  <AdminSectionCard eyebrow="Practice" title="Lab progress" description="Backend Lab attempt records.">
    {#if data.learner.lab_progress.length}<AdminTable caption="Lab progress" columns={['Lab', 'Level', 'Status', 'Score', 'Safety', 'Updated']}>{#each data.learner.lab_progress as item}<tr><td>{item.lab_id}</td><td>{item.level}</td><td><AdminStatusBadge label={item.status} tone={item.status === 'passed' ? 'success' : 'info'} /></td><td>{item.score ?? 'Not scored'}</td><td>{item.safety_score ?? 'Not scored'}</td><td>{item.updated_at}</td></tr>{/each}</AdminTable>{:else}<AdminEmptyState title="No Lab progress" detail="The backend returned no Lab attempts for this learner." />{/if}
  </AdminSectionCard>
{/if}
