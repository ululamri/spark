<script lang="ts">
  import { page } from '$app/state';

  type AdminActor = {
    mode: 'superadmin' | 'delegated';
    role: string;
    actorKind: string;
    capabilities: string[];
  } | null;

  type AdminNavItem = {
    href: string;
    label: string;
    roles: string[];
    capability?: string;
  };

  let { actor }: { actor: AdminActor } = $props();

  const navigation: AdminNavItem[] = [
    { href: '/admin', label: 'Root overview', roles: ['superadmin'] },
    { href: '/admin/learners', label: 'Learners', roles: ['superadmin'] },
    { href: '/admin/lessons', label: 'Core lessons', roles: ['superadmin'] },
    { href: '/admin/lab', label: 'Practice Lab', roles: ['superadmin'] },
    { href: '/admin/passport', label: 'Passport', roles: ['superadmin'] },
    { href: '/admin/proofs', label: 'Proof Ledger', roles: ['superadmin'] },
    { href: '/admin/pilots', label: 'Community pilot', roles: ['superadmin'] },
    { href: '/admin/moderation', label: 'Moderation', roles: ['superadmin', 'admin', 'moderator'], capability: 'moderation_read' },
    { href: '/admin/team', label: 'Admin team', roles: ['superadmin', 'admin'], capability: 'audit_read' },
    { href: '/admin/reset/requests', label: 'Reset requests', roles: ['superadmin', 'admin'] },
    { href: '/admin/audit', label: 'Audit log', roles: ['superadmin', 'admin'], capability: 'audit_read' },
    { href: '/admin/starknet', label: 'Starknet / Hub', roles: ['superadmin'] },
    { href: '/admin/content', label: 'Learn & Lab CMS', roles: ['superadmin', 'admin'], capability: 'content_read' },
    { href: '/admin/settings', label: 'Operations', roles: ['superadmin', 'admin', 'moderator'] }
  ];

  const roleLabel = $derived(actor?.role ?? 'unauthenticated');
  const modeLabel = $derived(actor?.mode === 'superadmin' ? 'Root control' : 'Delegated control');

  const visibleNavigation = $derived(
    navigation.filter((item) => {
      if (!actor) return false;
      if (!item.roles.includes(actor.role)) return false;
      if (!item.capability) return true;
      return actor.capabilities.includes(item.capability);
    })
  );

  function isActive(href: string) {
    return href === '/admin' ? page.url.pathname === href : page.url.pathname.startsWith(href);
  }
</script>

<aside class="admin-sidebar">
  <a class="admin-brand" href="/admin">
    <img src="/assets/brand/icon-only.svg" alt="" width="38" height="38" />
    <span>
      <strong>Karyra Spark</strong>
      <small>{modeLabel} · {roleLabel}</small>
    </span>
  </a>

  <nav aria-label="Admin navigation">
    {#each visibleNavigation as item}
      <a href={item.href} class:active={isActive(item.href)} aria-current={isActive(item.href) ? 'page' : undefined}>
        {item.label}
      </a>
    {/each}
  </nav>

  <div class="admin-sidebar__footer">
    <a href="/" target="_blank" rel="noreferrer">Open public Spark</a>
    <form method="POST" action="/admin/logout">
      <button type="submit">Sign out</button>
    </form>
  </div>
</aside>
