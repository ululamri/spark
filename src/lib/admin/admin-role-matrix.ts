export type AdminRoleKey = 'superadmin' | 'admin' | 'moderator';

export type AdminRoleProfile = {
  role: AdminRoleKey;
  label: string;
  eyebrow: string;
  title: string;
  description: string;
  primarySurface: string;
  allowedWork: string[];
  blockedWork: string[];
  canManageMl: boolean;
  canRunBulk: boolean;
  canReviewReports: boolean;
};

const ROLE_COPY: Record<AdminRoleKey, Omit<AdminRoleProfile, 'canManageMl' | 'canRunBulk' | 'canReviewReports'>> = {
  superadmin: {
    role: 'superadmin',
    label: 'Root control',
    eyebrow: 'Superadmin surface',
    title: 'Root moderation oversight',
    description: 'Superadmin keeps full control over moderation, admin team, audit, settings, and escalation paths.',
    primarySurface: 'Full /admin control plane with moderation as one operational section.',
    allowedWork: ['Root oversight', 'Admin team control', 'Audit review', 'ML moderation', 'Bulk moderation', 'Settings and escalation'],
    blockedWork: ['None inside the internal admin surface.']
  },
  admin: {
    role: 'admin',
    label: 'Admin operations',
    eyebrow: 'Admin operations surface',
    title: 'Operational moderation cockpit',
    description: 'Admin focuses on queue operations: ML tools, bulk moderation, reports, and content safety workflow.',
    primarySurface: '/admin/moderation with ops queue, bulk tools, ML tools, reports, and job history.',
    allowedWork: ['Review moderation queues', 'Create and review ML signals', 'Run bulk moderation jobs', 'Inspect reports', 'Inspect job history'],
    blockedWork: ['Admin team management', 'Root settings', 'Full audit control', 'Developer-level operations']
  },
  moderator: {
    role: 'moderator',
    label: 'Moderator review',
    eyebrow: 'Moderator review surface',
    title: 'Focused review queue',
    description: 'Moderator sees a narrower queue-first interface for reports, posts, comments, and ML signals without root/admin controls.',
    primarySurface: '/admin/moderation with review-first queues and limited or read-only action surface.',
    allowedWork: ['Review reports', 'Inspect posts and comments', 'Inspect ML signals', 'Inspect moderation job history'],
    blockedWork: ['Bulk moderation by default', 'ML signal creation by default', 'Admin team management', 'Root settings', 'Full audit control']
  }
};

function roleKey(role: string | null | undefined): AdminRoleKey {
  if (role === 'superadmin' || role === 'admin' || role === 'moderator') return role;
  return 'moderator';
}

function hasCapability(capabilities: string[], capability: string) {
  return capabilities.includes(capability);
}

export function adminRoleProfile(role: string | null | undefined, capabilities: string[] = []): AdminRoleProfile {
  const key = roleKey(role);
  return {
    ...ROLE_COPY[key],
    canManageMl: hasCapability(capabilities, 'ml_moderation_manage'),
    canRunBulk: hasCapability(capabilities, 'moderation_bulk'),
    canReviewReports: hasCapability(capabilities, 'reports_manage') || hasCapability(capabilities, 'moderation_action')
  };
}
