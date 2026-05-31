<script lang="ts">
  import type { Component } from 'svelte';
  import {
    BookOpen,
    Bookmark,
    CheckCircle2,
    ChevronRight,
    CircleHelp,
    ClipboardCheck,
    Compass,
    FlaskConical,
    Home,
    Layers3,
    Menu,
    Moon,
    Network,
    PanelLeft,
    Search,
    Settings,
    ShieldCheck,
    Sparkles,
    Sun,
    UserRound,
    Users,
    X,
    Zap
  } from '@lucide/svelte';

  type IconProps = {
    size?: number | string;
    strokeWidth?: number | string;
    class?: string;
    'aria-hidden'?: boolean | 'true' | 'false';
  };

  type IconComponent = Component<IconProps>;

  type Props = {
    name: string;
    size?: number;
    strokeWidth?: number;
    class?: string;
  };

  let { name, size = 18, strokeWidth = 2, class: className = '' }: Props = $props();

  const icons: Record<string, IconComponent> = {
    'book-open': BookOpen,
    bookmark: Bookmark,
    check: CheckCircle2,
    'chevron-right': ChevronRight,
    compass: Compass,
    'flask-conical': FlaskConical,
    help: CircleHelp,
    home: Home,
    layers: Layers3,
    menu: Menu,
    moon: Moon,
    network: Network,
    panel: PanelLeft,
    search: Search,
    settings: Settings,
    shield: ShieldCheck,
    sparkles: Sparkles,
    sun: Sun,
    user: UserRound,
    'user-round': UserRound,
    users: Users,
    x: X,
    zap: Zap,
    clipboard: ClipboardCheck
  };

  const Icon = $derived(icons[name] ?? Sparkles);
</script>

<Icon {size} {strokeWidth} class={className} aria-hidden="true" />
