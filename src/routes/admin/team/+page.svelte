<script lang="ts">
  import AdminEmptyState from '$lib/admin/ui/AdminEmptyState.svelte';
  import AdminHeader from '$lib/admin/ui/AdminHeader.svelte';
  import AdminSectionCard from '$lib/admin/ui/AdminSectionCard.svelte';
  import AdminStatCard from '$lib/admin/ui/AdminStatCard.svelte';
  import AdminStatusBadge from '$lib/admin/ui/AdminStatusBadge.svelte';
  import AdminTable from '$lib/admin/ui/AdminTable.svelte';
  import { toast } from 'svelte-sonner';
  import { toastFormResult } from '$lib/admin/admin-toast';

  let { data, form } = $props();

  const members = $derived(data.members?.items ?? []);
  const invitations = $derived(data.invitations?.items ?? []);
  const roles = $derived(data.roles ?? []);
  const filters = $derived(data.filters ?? { role: 'all', status: 'active', invitationStatus: 'pending' });
  const viewForm = $derived((form ?? {}) as Record<string, any>);
  let lastAdminTeamToastMarker = $state('');
  let lastManualInviteToastMarker = $state('');
  const adminCount = $derived(members.filter((member) => member.role === 'admin').length);
  const moderatorCount = $derived(members.filter((member) => member.role === 'moderator').length);
  const pendingInviteCount = $derived(invitations.filter((invite) => invite.status === 'pending').length);
  const assignableRoles = $derived(roles.filter((role) => role.role !== 'superadmin' && (data.canInviteAdmin || role.role !== 'admin')));
  let lastToastMarker = $state('');

  const metrics = $derived([
    { id: 'members', label: 'Loaded members', value: members.length, detail: 'Delegated assignments loaded in this window.', state: 'available' as const },
    { id: 'admins', label: 'Admins', value: adminCount, detail: 'Operational admins in the loaded window.', state: 'available' as const },
    { id: 'moderators', label: 'Moderators', value: moderatorCount, detail: 'Moderation-focused operators in the loaded window.', state: 'available' as const },
    { id: 'pending-invites', label: 'Pending invites', value: pendingInviteCount, detail: 'Invite-only onboarding links waiting for acceptance.', state: 'available' as const }
  ]);

  function tone(status: string) {
    if (status === 'active' || status === 'accepted') return 'success' as const;
    if (status === 'expired' || status === 'pending') return 'warning' as const;
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

  $effect(() => {
    const marker = toastFormResult(viewForm, {
      id: 'admin-team',
      successLabel: 'Admin team updated',
      errorLabel: 'Admin team action failed'
    });
    if (marker && marker !== lastToastMarker) lastToastMarker = marker;
  });

  $effect(() => {
    if (viewForm.invitation?.manual_token) {
      toast.info('Manual invite code available', {
        description: 'Share this token only through an approved private channel.'
      });
    }
  });
</script>

<svelte:head><title>Admin team - Karyra Spark Admin</title></svelte:head>

<AdminHeader
  title="Admin team"
  description="Invite-only delegated admin and moderator management. Superadmin remains the separate legacy root boundary."
>
  {#snippet actions()}
    <a class="admin-button--secondary" href="/admin/audit?action=admin_invitation_create">Invitation audit</a>
  {/snippet}
</AdminHeader>

{#if viewForm.success}
  <div class="admin-note admin-note--success">{viewForm.success}</div>
{:else if viewForm.error}
  <div class="admin-note admin-note--danger">{viewForm.error}</div>
{/if}

{#if viewForm.invitation?.manual_token}
  <div class="admin-note admin-note--success">
    <strong>Manual invite code</strong><br />
    Share this token only through an approved private channel. The invited user opens <code>/admin/onboarding</code> and uses this invite code.
    <code>{viewForm.invitation.manual_token}</code>
  </div>
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
  <AdminSectionCard eyebrow="Invite-only" title="Create admin/moderator invitation" description="Role activation happens only after invite token, email OTP, password setup, and authenticator 2FA onboarding.">
    {#if data.canInviteTeam}
      <form class="admin-moderation-form" method="POST" action="?/createInvitation">
        <label>
          Invited email
          <input name="email" type="email" placeholder="operator@example.com" required />
        </label>
        <label>
          Role
          <select name="role" required>
            {#each assignableRoles as role}
              <option value={role.role}>{role.role === 'admin' ? 'Admin' : 'Moderator'}</option>
            {/each}
          </select>
        </label>
        <label>
          Reason
          <input name="reason" placeholder="Why this operator is being invited" />
        </label>
        <label>
          Expires at
          <input name="expires_at" placeholder="Optional RFC3339 timestamp" />
        </label>
        <div class="admin-checkbox-row">
          {#each assignableRoles as role}
            {#each role.capabilities as capability}
              <label><input type="checkbox" name="capabilities" value={capability} /> {capability}</label>
            {/each}
          {/each}
        </div>
        <button class="admin-button" type="submit">Kirim undangan</button>
      </form>
    {:else}
      <div class="admin-note">This role cannot create invitations. Moderator accounts are review-only in the admin team boundary.</div>
    {/if}
  </AdminSectionCard>

  <AdminSectionCard eyebrow="Safety boundary" title="No direct delegated role creation" description="The previous direct grant/update workflow is intentionally removed from this UI.">
    <ul class="admin-checklist">
      <li>Superadmin can invite admin and moderator.</li>
      <li>Admin can invite moderator only.</li>
      <li>Moderator cannot invite anyone.</li>
      <li>Every invite and revoke writes backend audit events.</li>
    </ul>
  </AdminSectionCard>
</div>

<AdminSectionCard eyebrow="Invitations" title="Invitation queue" description="Pending, accepted, revoked, or expired invite-only onboarding records.">
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
        Invitation status
        <select name="invitation_status">
          <option value="pending" selected={filters.invitationStatus === 'pending'}>Pending</option>
          <option value="accepted" selected={filters.invitationStatus === 'accepted'}>Accepted</option>
          <option value="revoked" selected={filters.invitationStatus === 'revoked'}>Revoked</option>
          <option value="expired" selected={filters.invitationStatus === 'expired'}>Expired</option>
          <option value="all" selected={filters.invitationStatus === 'all'}>All</option>
        </select>
      </label>
      <button class="admin-button" type="submit">Apply filters</button>
      <a class="admin-button--secondary" href="/admin/team">Reset</a>
    </div>
  </form>

  {#if invitations.length}
    <AdminTable caption="Admin invitations" columns={['Invite', 'Role', 'Status', 'Inviter', 'Actions']}>
      {#each invitations as invitation}
        <tr>
          <td>
            <strong>{invitation.email}</strong><br />
            <span class="admin-muted">created {invitation.created_at} · expires {invitation.expires_at}</span>
          </td>
          <td><AdminStatusBadge label={invitation.role} tone={roleTone(invitation.role)} /></td>
          <td><AdminStatusBadge label={invitation.status} tone={tone(invitation.status)} /></td>
          <td><span class="admin-muted">{invitation.invited_by_actor_kind}</span></td>
          <td>
            {#if invitation.status === 'pending' && data.canInviteTeam}
              <form class="admin-inline-form" method="POST" action="?/revokeInvitation">
                <input type="hidden" name="invitation_id" value={invitation.id} />
                <input name="reason" placeholder="Revoke reason" />
                <button class="admin-button admin-button--secondary" type="submit">Cabut undangan</button>
              </form>
            {:else}
              <span class="admin-muted">No action</span>
            {/if}
          </td>
        </tr>
      {/each}
    </AdminTable>
  {:else}
    <AdminEmptyState title="No invitations in this filter" detail="Create a new invite or switch the invitation status filter." />
  {/if}
</AdminSectionCard>

<AdminSectionCard eyebrow="Members" title="Delegated operators" description="Active/revoked delegated role assignments after invite onboarding is accepted.">
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
        Member status
        <select name="status">
          <option value="active" selected={filters.status === 'active'}>Active</option>
          <option value="revoked" selected={filters.status === 'revoked'}>Revoked</option>
          <option value="expired" selected={filters.status === 'expired'}>Expired</option>
        </select>
      </label>
      <button class="admin-button" type="submit">Apply filters</button>
    </div>
  </form>

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
            {#if member.status === 'active' && data.canRevokeMember}
              <form class="admin-inline-form" method="POST" action="?/revokeMember">
                <input type="hidden" name="user_id" value={member.user_id} />
                <input type="hidden" name="role" value={member.role} />
                <input name="reason" placeholder="Revoke reason" />
                <button class="admin-button admin-button--secondary" type="submit">Cabut role</button>
              </form>
            {:else}
              <span class="admin-muted">No action</span>
            {/if}
          </td>
        </tr>
      {/each}
    </AdminTable>
  {:else}
    <AdminEmptyState title="No delegated operators in this filter" detail="Accepted invitations will appear here after onboarding is completed." />
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
