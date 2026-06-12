<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data } = $props();
  let query = $state('');
  let statusFilter = $state('all');
  const filteredLessons = $derived(
    data.lessons.filter((lesson) => {
      const needle = query.trim().toLowerCase();
      const matches = !needle || [lesson.title, lesson.slug, lesson.moduleTitle].some((value) => value.toLowerCase().includes(needle));
      return matches && (statusFilter === 'all' || lesson.status === statusFilter);
    })
  );
</script>

<svelte:head><title>Core lessons - Karyra Spark Admin</title></svelte:head>
<AdminHeader title="Core lessons" description="Observed backend lesson progress enriched with source-controlled public catalog metadata where available.">
  {#snippet actions()}<a class="admin-button--secondary" href="/core" target="_blank" rel="noreferrer">Preview Core</a>{/snippet}
</AdminHeader>
<AdminSectionCard eyebrow="Observed content" title="Lesson inventory" description="Admin API v1 reports lesson identifiers observed in progress records; title and preview metadata come from the existing frontend catalog.">
  {#if data.apiError}
    <AdminEmptyState state="error" title="Lesson data could not be loaded" detail={data.apiError} />
  {:else if data.dataSource === 'not_available'}
    <AdminEmptyState title="Lesson data is not available" detail="The backend reported data_source: not_available. No fallback lesson inventory is shown." />
  {:else}
    <div class="admin-filter-row"><label>Search title, slug, or module<input bind:value={query} type="search" placeholder="Search lessons" /></label><label>Status<select bind:value={statusFilter}><option value="all">All statuses</option><option value="published">Published</option><option value="observed">Observed</option></select></label></div>
    {#if filteredLessons.length}
      <AdminTable caption="Observed lesson inventory" columns={['Lesson', 'Module', 'Status', 'Completions', 'Updated', 'Preview']}>
        {#each filteredLessons as lesson}<tr><td><strong>{lesson.title}</strong><br /><span class="admin-code">{lesson.slug}</span></td><td>{lesson.moduleTitle}</td><td><AdminStatusBadge label={lesson.status} tone={lesson.status === 'published' ? 'success' : 'info'} /></td><td>{lesson.completion_count}</td><td>{lesson.updated_at || 'Not tracked'}</td><td>{#if lesson.previewHref}<a href={lesson.previewHref} target="_blank" rel="noreferrer">Open lesson</a>{:else}<span class="admin-muted">No catalog match</span>{/if}</td></tr>{/each}
      </AdminTable>
    {:else}<AdminEmptyState title="No observed lessons" detail="The backend has no lesson progress identifiers yet. Static catalog entries are not shown as production activity." />{/if}
  {/if}
</AdminSectionCard>
