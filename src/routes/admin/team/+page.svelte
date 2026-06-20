<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatCard from '$lib/admin/ui/AdminStatCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';

  let { data, form } = $props();

  const members = $derived(data.members?.items ?? []);
  const roles = $derived(data.roles ?? []);
  const filters = $derived(data.filters ?? { role: 'all', status: 'active' });
  const adminCount = $derived(members.filter((member) => member.role === 'admin').length);
  const moderatorCount = $derived(members.filter((member) => member.role === 'moderator').length);
  const expiringCount = $derived(members.filter((member) => member.expires_at).length);

  const metrics = $derived([
    { id: 'members', label: 'Loaded members', value: members.length, detail: 'Delegated admin assignments loaded in this window.', state: 'available' as const },
    { id: 'admins', label: 'Admins', value: adminCount, detail: 'Operational admins in the loaded window.', state: 'available' as const },
    { id: 'moderators', label: 'Moderators', value: moderatorCount, detail: 'Moderation-focused operators in the loaded window.', state: 'available' as const },
    { id: 'expiring', label: 'Expiring roles', value: expiringCount, detail: 'Assignments with an expiry timestamp.', state: 'available' as const }
  ]);

  function tone(status: string) {
    if (status === 'active') return 'success' as const;
    if (status === 'expired') return 'warning' as const;
    if (status === 'revoked') return 'danger' as const;
    return 'neutral' as const;
  }

  function roleTone(role: string) {
    if (role === 'admin') return 'warning' as const;
    if (role === 'moderator') return 'success' as const;
    return 'neutral' as const;
  }

  function shortId(value: string | null | undefined) {
    return value ? value.slice(0, 8) : '—';
  }
</script>

<svelte:head><title>Admin team - Karyra Spark Admin</title></svelte:head>

<AdminHeader
  title="Admin team"
  description="Delegated admin and moderator role assignments. Superadmin remains the legacy environment root token, not a user account."
>
  {#snippet actions()}
    <a class="admin-button--secondary" href="/admin/audit?action=admin_role_upsert">Role audit</a>
  {/snippet}
</AdminHeader>

{#if form?.success}
  <div class="admin-note admin-note--success">{form.success}</div>
{:else if form?.error}
  <div class="admin-note admin-note--danger">{form.error}</div>
{/if}

{#if data.apiError}
  <AdminEmptyState state="error" title="Admin team API unavailable" detail={data.apiError} />
{/if}

<div class="admin-stat-grid">
  {#each metrics as metric}
    <AdminStatCard {...metric} />
  {/each}
</div>

<div class="admin-card-grid">
  <AdminSectionCard eyebrow="Delegation" title="Grant or update role" description="Use email for existing active users. Empty capabilities uses backend defaults for the selected role.">
    <form class="admin-moderation-form" method="POST" action="?/upsertMember">
      <label>
        User email
        <input name="email" type="email" placeholder="operator@example.com" />
      </label>
      <label>
        Or user ID
        <input name="user_id" placeholder="UUID" />
      </label>
      <label>
        Role
        <select name="role" required>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
      </label>
      <label>
        Reason
        <input name="reason" placeholder="Why this delegation is needed" />
      </label>
      <label>
        Expires at
        <input name="expires_at" placeholder="Optional RFC3339 timestamp" />
      </label>
      <div class="admin-checkbox-row">
        {#each roles.filter((role) => role.role !== 'superadmin') as role}
          {#each role.capabilities as capability}
            <label><input type="checkbox" name="capabilities" value={capability} /> {capability}</label>
          {/each}
        {/each}
      </div>
      <button class="admin-button" type="submit">Save delegated role</button>
    </form>
  </AdminSectionCard>

  <AdminSectionCard eyebrow="Safety boundary" title="Superadmin stays legacy root" description="This UI only manages delegated user-based admin/moderator assignments.">
    <ul class="admin-checklist">
      <li>No superadmin user is created from this UI.</li>
      <li>Write actions require backend `admin_manage` capability.</li>
      <li>Every grant/update/revoke writes an audit event.</li>
      <li>Moderator defaults do not include restore unless explicitly changed in backend policy.</li>
    </ul>
  </AdminSectionCard>
</div>

<AdminSectionCard eyebrow="Filters" title="Delegated role list" description="Read current or revoked assignments. Filters are URL-based and read-only.">
  <form class="admin-moderation-form" method="GET" action="/admin/team">
    <div class="admin-filter-row">
      <label>
        Role
        <select name="role">
          <option value="all" selected={filters.role === 'all'}>All roles</option>
          <option value="admin" selected={filters.role === 'admin'}>Admin</option>
          <option value="moderator" selected={filters.role === 'moderator'}>Moderator</option>
        </select>
      </label>
      <label>
        Status
        <select name="status">
          <option value="active" selected={filters.status === 'active'}>Active</option>
          <option value="revoked" selected={filters.status === 'revoked'}>Revoked</option>
          <option value="expired" selected={filters.status === 'expired'}>Expired</option>
        </select>
      </label>
      <button class="admin-button" type="submit">Apply filters</button>
      <a class="admin-button--secondary" href="/admin/team">Reset</a>
    </div>
  </form>
</AdminSectionCard>

<AdminSectionCard eyebrow="Members" title="Delegated operators" description="Active/revoked delegated role assignments from the backend RBAC table.">
  {#if members.length}
    <AdminTable caption="Delegated admin team" columns={['Member', 'Role', 'Capabilities', 'Reason', 'Actions']}>
      {#each members as member}
        <tr>
          <td>
            <strong>{member.display_name}</strong><br />
            <span class="admin-muted">{member.email} · {shortId(member.user_id)}</span>
          </td>
          <td>
            <AdminStatusBadge label={member.role} tone={roleTone(member.role)} />
            <div class="admin-muted"><AdminStatusBadge label={member.status} tone={tone(member.status)} /></div>
            <div class="admin-muted">expires {member.expires_at || 'never'}</div>
          </td>
          <td>
            <span class="admin-muted">{member.capabilities.slice(0, 8).join(', ')}{member.capabilities.length > 8 ? '…' : ''}</span>
          </td>
          <td>
            {member.reason || '—'}<br />
            <span class="admin-muted">updated {member.updated_at}</span>
          </td>
          <td>
            {#if member.status === 'active'}
              <form class="admin-inline-form" method="POST" action="?/revokeMember">
                <input type="hidden" name="user_id" value={member.user_id} />
                <input type="hidden" name="role" value={member.role} />
                <input name="reason" placeholder="Revoke reason" />
                <button class="admin-button admin-button--secondary" type="submit">Revoke</button>
              </form>
            {:else}
              <span class="admin-muted">No action</span>
            {/if}
          </td>
        </tr>
      {/each}
    </AdminTable>
  {:else if !data.apiError}
    <AdminEmptyState title="No delegated assignments match filters" detail="Adjust filters or grant a role to an existing active user." />
  {/if}
</AdminSectionCard>

<AdminSectionCard eyebrow="Role catalog" title="Backend capability catalog" description="Capabilities returned by the protected backend team endpoint.">
  <div class="admin-status-grid">
    {#each roles as role}
      <div class="admin-status-card">
        <div class="admin-status-card__top"><strong>{role.role}</strong><AdminStatusBadge label={role.capabilities.length + ' capabilities'} tone={role.role === 'superadmin' ? 'warning' : 'success'} /></div>
        <p>{role.description}</p>
        <p class="admin-muted">{role.capabilities.join(', ')}</p>
      </div>
    {/each}
  </div>
</AdminSectionCard>
