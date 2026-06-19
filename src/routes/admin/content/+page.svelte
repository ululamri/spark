<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatCard from '$lib/admin/ui/AdminStatCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data, form } = $props();

  const items = $derived(data.cms?.items ?? []);
  const filters = $derived(data.filters);
  const draftCount = $derived(items.filter((item) => item.status === 'draft').length);
  const reviewCount = $derived(items.filter((item) => item.status === 'review').length);
  const publishedCount = $derived(items.filter((item) => item.status === 'published').length);

  const metrics = $derived([
    { id: 'items', label: 'Loaded CMS items', value: items.length, detail: 'Learn/Lab CMS records loaded from backend.', state: 'available' as const },
    { id: 'drafts', label: 'Drafts', value: draftCount, detail: 'Draft items in this window.', state: 'available' as const },
    { id: 'review', label: 'Review', value: reviewCount, detail: 'Items waiting for review.', state: 'available' as const },
    { id: 'published', label: 'Published', value: publishedCount, detail: 'Published items in this window.', state: 'available' as const }
  ]);

  function tone(status: string) {
    if (status === 'published') return 'success' as const;
    if (status === 'review') return 'warning' as const;
    if (status === 'archived') return 'neutral' as const;
    return 'neutral' as const;
  }

  function kindLabel(kind: string) {
    if (kind === 'core_lesson') return 'Core lesson';
    if (kind === 'lab') return 'Lab';
    return kind;
  }
</script>

<svelte:head><title>Learn & Lab CMS - Karyra Spark Admin</title></svelte:head>

<AdminHeader title="Learn & Lab CMS" description="Operational CMS surface for Core Learn and Lab content only. Unrelated project documents are intentionally not shown here." />

{#if form?.success}
  <div class="admin-note admin-note--success">{form.success}</div>
{:else if form?.error}
  <div class="admin-note admin-note--danger">{form.error}</div>
{/if}

{#if data.apiError}
  <AdminEmptyState state="error" title="CMS API unavailable" detail={data.apiError} />
{/if}

<div class="admin-stat-grid">
  {#each metrics as metric}
    <AdminStatCard {...metric} />
  {/each}
</div>

<div class="admin-card-grid">
  {#if data.canCreate}
    <AdminSectionCard eyebrow="Draft" title="Create Learn/Lab draft" description="Creates a backend CMS item with an initial revision. Publishing controls will be expanded in the next CMS pass.">
      <form class="admin-moderation-form" method="POST" action="?/createDraft">
        <label>
          Kind
          <select name="kind" required>
            <option value="core_lesson">Core lesson</option>
            <option value="lab">Lab</option>
          </select>
        </label>
        <label>
          Slug
          <input name="slug" placeholder="intro-to-starknet" required />
        </label>
        <label>
          Title
          <input name="title" placeholder="Intro to Starknet" required />
        </label>
        <label>
          Summary
          <input name="summary" placeholder="Initial draft summary" />
        </label>
        <label>
          Body seed
          <textarea name="body" placeholder="Initial content body"></textarea>
        </label>
        <button class="admin-button" type="submit">Create draft</button>
      </form>
    </AdminSectionCard>
  {:else}
    <AdminSectionCard eyebrow="Read-only" title="Draft creation is locked" description="This role can read content but does not have content_create capability.">
      <div class="admin-note">Ask a superadmin/admin with content_create to create or edit CMS drafts.</div>
    </AdminSectionCard>
  {/if}

  <AdminSectionCard eyebrow="Permissions" title="Content capabilities" description="This page adapts to the current role capabilities.">
    <ul class="admin-checklist">
      <li>Read: {data.canCreate || data.canEdit || data.canPublish || data.canArchive || items.length >= 0 ? 'available' : 'locked'}</li>
      <li>Create drafts: {data.canCreate ? 'available' : 'locked'}</li>
      <li>Edit revisions: {data.canEdit ? 'available' : 'locked'}</li>
      <li>Publish: {data.canPublish ? 'available' : 'locked'}</li>
      <li>Archive: {data.canArchive ? 'available' : 'locked'}</li>
    </ul>
  </AdminSectionCard>
</div>

<AdminSectionCard eyebrow="Filters" title="CMS item filters" description="Filters are URL-based and read-only.">
  <form class="admin-moderation-form" method="GET" action="/admin/content">
    <div class="admin-filter-row">
      <label>
        Kind
        <select name="kind">
          <option value="all" selected={filters.kind === 'all'}>All</option>
          <option value="core_lesson" selected={filters.kind === 'core_lesson'}>Core lessons</option>
          <option value="lab" selected={filters.kind === 'lab'}>Lab</option>
        </select>
      </label>
      <label>
        Status
        <select name="status">
          <option value="all" selected={filters.status === 'all'}>All</option>
          <option value="draft" selected={filters.status === 'draft'}>Draft</option>
          <option value="review" selected={filters.status === 'review'}>Review</option>
          <option value="published" selected={filters.status === 'published'}>Published</option>
          <option value="archived" selected={filters.status === 'archived'}>Archived</option>
        </select>
      </label>
      <label>
        Search
        <input name="q" value={filters.q} placeholder="slug or title" />
      </label>
      <button class="admin-button" type="submit">Apply filters</button>
      <a class="admin-button--secondary" href="/admin/content">Reset</a>
    </div>
  </form>
</AdminSectionCard>

<AdminSectionCard eyebrow="Content" title="Learn/Lab CMS items" description="Backend CMS records for Karyra Spark learning and lab content.">
  {#if items.length}
    <AdminTable caption="Learn and Lab CMS items" columns={['Content', 'Kind', 'Status', 'Revision', 'Updated']}>
      {#each items as item}
        <tr>
          <td>
            <strong>{item.title}</strong><br />
            <span class="admin-muted">{item.slug}</span>
          </td>
          <td>{kindLabel(item.kind)}</td>
          <td><AdminStatusBadge label={item.status} tone={tone(item.status)} /></td>
          <td>{item.current_version ? 'v' + item.current_version : 'no revision'}</td>
          <td>{item.updated_at}</td>
        </tr>
      {/each}
    </AdminTable>
  {:else if !data.apiError}
    <AdminEmptyState title="No CMS items match filters" detail="Create a draft or adjust filters. This page intentionally excludes unrelated project documentation." />
  {/if}
</AdminSectionCard>
