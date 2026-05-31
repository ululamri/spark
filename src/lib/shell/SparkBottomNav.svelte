<script lang="ts">
  import { page } from '$app/state';

  const items = [
    { href: '/', label: 'Home', icon: '⌂' },
    { href: '/core', label: 'Learn', icon: '◆' },
    { href: '/lab', label: 'Lab', icon: '⌁' },
    { href: '/community', label: 'Komunitas', icon: '●' },
    { href: '/profile', label: 'Profil', icon: '◉' }
  ];

  function isActive(href: string) {
    if (href === '/') return page.url.pathname === '/';
    return page.url.pathname === href || page.url.pathname.startsWith(`${href}/`);
  }
</script>

<nav class="spark-bottom-nav" aria-label="Navigasi mobile">
  {#each items as item}
    <a href={item.href} class:active={isActive(item.href)}>
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </a>
  {/each}
</nav>
