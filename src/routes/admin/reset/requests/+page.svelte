<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatCard from '$lib/admin/ui/AdminStatCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data, form } = $props();

  const requests = $derived(data.requests?.items ?? []);
  const filters = $derived(data.filters ?? { status: 'pending', requestType: 'all' });
  const viewForm = $derived((form ?? {}) as Record<string, any>);
  const reviewerRole = $derived(data.reviewerRole ?? 'admin');
  const pendingCount = $derived(requests.filter((item) => item.status === 'pending').length);
  const approvedCount = $derived(requests.filter((item) => item.status === 'approved').length);
  const rejectedCount = $derived(requests.filter((item) => item.status === 'rejected').length);

  const metrics = $derived([
    { id: 'requests', label: 'Loaded requests', value: requests.length, detail: reviewerRole === 'superadmin' ? 'All visible reset requests.' : 'Moderator reset requests visible to admin.', state: 'available' as const },
    { id: 'pending', label: 'Pending', value: pendingCount, detail: 'Requests waiting for review.', state: 'available' as const },
    { id: 'approved', label: 'Approved', value: approvedCount, detail: 'Approved in current filter.', state: 'available' as const },
    { id: 'rejected', label: 'Rejected', value: rejectedCount, detail: 'Rejected in current filter.', state: 'available' as const }
  ]);

  function tone(status: string) {
    if (status === 'approved' || status === 'completed') return 'success' as const;
    if (status === 'pending') return 'warning' as const;
    if (status === 'rejected' || status === 'expired') return 'danger' as const;
    return 'neutral' as const;
  }

  function roleTone(role: string | null | undefined) {
    if (role === 'admin') return 'warning' as const;
    if (role === 'moderator') return 'success' as const;
    return 'neutral' as const;
  }

  function typeLabel(type: string) {
    if (type === 'totp') return '2FA';
    if (type === 'email') return 'Email';
    if (type === 'password') return 'Password';
    return type;
  }

  function noteFrom(metadata: Record<string, unknown>) {
    const note = metadata?.note;
    return typeof note === 'string' && note.length ? note : '—';
  }
</script>

<svelte:head><title>Reset requests - Karyra Spark Admin</title></svelte:head>

<AdminHeader
  title="Reset requests"
  description="Hierarchical recovery review: superadmin controls all reset approvals; admin can only review moderator reset requests."
>
  {#snippet actions()}
    <a class="admin-button--secondary" href="/admin/audit?action=admin_reset_request_review">Review audit</a>
  {/snippet}
</AdminHeader>

{#if viewForm.success}
  <div class="admin-note admin-note--success">{viewForm.success}</div>
{:else if viewForm.error}
  <div class="admin-note admin-note--danger">{viewForm.error}</div>
{/if}

{#if viewForm.recoveryArtifact}
  <div class="admin-note admin-note--success">
    <strong>Recovery artifact issued.</strong>
    <p>Artifact ID: {viewForm.recoveryArtifact.artifact.id}</p>
    <p>Expires: {viewForm.recoveryArtifact.artifact.expires_at}</p>
    <p>Delivery mode: {viewForm.recoveryArtifact.delivery_mode}</p>
    {#if viewForm.recoveryArtifact.manual_token}
      <p><strong>Manual bootstrap token:</strong> {viewForm.recoveryArtifact.manual_token}</p>
    {/if}
  </div>
{/if}

{#if data.apiError}
  <AdminEmptyState state="error" title="Reset request API unavailable" detail={data.apiError} />
{/if}

<div class="admin-stat-grid">
  {#each metrics as metric}
    <AdminStatCard {...metric} />
  {/each}
</div>

<AdminSectionCard eyebrow="Policy" title="Reset approval boundary" description="Approval records review evidence only; it does not automatically change password, email, or 2FA.">
  <ul class="admin-checklist">
    <li>Superadmin can review admin and moderator reset requests.</li>
    <li>Admin can review moderator reset requests only.</li>
    <li>Admin reset requests go upward to superadmin.</li>
    <li>Moderator cannot review reset requests.</li>
    <li>Approved requests may issue a short-lived recovery artifact; credential changes remain a separate recovery flow.</li>
  </ul>
</AdminSectionCard>

<AdminSectionCard eyebrow="Filters" title="Recovery request queue" description="The backend scopes this queue by reviewer role. Admin users will only see moderator reset requests.">
  <form class="admin-moderation-form" method="GET" action="/admin/reset/requests">
    <div class="admin-filter-row">
      <label>
        Status
        <select name="status">
          <option value="pending" selected={filters.status === 'pending'}>Pending</option>
          <option value="approved" selected={filters.status === 'approved'}>Approved</option>
          <option value="rejected" selected={filters.status === 'rejected'}>Rejected</option>
          <option value="completed" selected={filters.status === 'completed'}>Completed</option>
          <option value="expired" selected={filters.status === 'expired'}>Expired</option>
          <option value="all" selected={filters.status === 'all'}>All</option>
        </select>
      </label>
      <label>
        Type
        <select name="request_type">
          <option value="all" selected={filters.requestType === 'all'}>All</option>
          <option value="password" selected={filters.requestType === 'password'}>Password</option>
          <option value="email" selected={filters.requestType === 'email'}>Email</option>
          <option value="totp" selected={filters.requestType === 'totp'}>2FA</option>
        </select>
      </label>
      <button class="admin-button" type="submit">Apply filters</button>
      <a class="admin-button--secondary" href="/admin/reset/requests">Reset</a>
    </div>
  </form>
</AdminSectionCard>

<AdminSectionCard eyebrow="Review" title="Recovery requests" description="Approve only after validating the person through the approved internal channel. Reject suspicious or incomplete requests.">
  {#if requests.length}
    <AdminTable caption="Admin reset requests" columns={['Request', 'Target', 'Status', 'Context', 'Review']}>
      {#each requests as item}
        <tr>
          <td>
            <strong>{item.email}</strong><br />
            <span class="admin-muted">{typeLabel(item.request_type)} · requested {item.requested_at}</span><br />
            <span class="admin-muted">expires {item.expires_at}</span>
          </td>
          <td>
            <AdminStatusBadge label={item.target_role ?? 'unknown'} tone={roleTone(item.target_role)} />
          </td>
          <td>
            <AdminStatusBadge label={item.status} tone={tone(item.status)} />
            {#if item.reviewed_at}
              <div class="admin-muted">reviewed {item.reviewed_at}</div>
            {/if}
          </td>
          <td>
            <span class="admin-muted">{noteFrom(item.metadata)}</span>
          </td>
          <td>
            {#if item.status === 'pending'}
              <form class="admin-inline-form" method="POST" action="?/reviewRequest">
                <input type="hidden" name="request_id" value={item.id} />
                <input name="reason" placeholder="Review reason" />
                <button class="admin-button" name="decision" value="approved" type="submit">Approve</button>
                <button class="admin-button admin-button--secondary" name="decision" value="rejected" type="submit">Reject</button>
              </form>
            {:else if item.status === 'approved'}
              <form class="admin-inline-form" method="POST" action="?/issueRecoveryArtifact">
                <input type="hidden" name="request_id" value={item.id} />
                <input name="reason" placeholder="Artifact reason" />
                <button class="admin-button" type="submit">Issue artifact</button>
              </form>
            {:else}
              <span class="admin-muted">No action</span>
            {/if}
          </td>
        </tr>
      {/each}
    </AdminTable>
  {:else}
    <AdminEmptyState title="No reset requests in this filter" detail="Submitted recovery requests from /admin/reset will appear here when visible to your reviewer role." />
  {/if}
</AdminSectionCard>
