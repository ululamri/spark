import { sparkLabs, sparkModules, sparkWorkshops } from '$lib/content/spark-content';
import type { AdminLabModule, AdminLesson, AdminPilotSession, AdminRoadmapModule } from './admin-types';

// Source-controlled catalogs only enrich backend observations where Admin API v1
// explicitly reports that it does not own lesson, Lab, or pilot metadata yet.
export const adminLessonCatalog: AdminLesson[] = sparkModules.flatMap((module) =>
  module.lessons.map((lesson) => ({
    id: lesson.id,
    moduleId: module.id,
    moduleTitle: module.title,
    title: lesson.title,
    slug: lesson.slug,
    status: 'published',
    estimatedMinutes: lesson.estimatedMinutes,
    updatedAt: null,
    previewHref: '/lesson/' + lesson.slug
  }))
);

export const adminLabCatalog: AdminLabModule[] = sparkLabs.map((lab) => ({
  id: lab.id,
  title: lab.title,
  difficulty: lab.difficulty,
  estimatedMinutes: lab.estimatedMinutes,
  checkpointCount: lab.steps.length,
  enabled: null,
  guardrail: lab.requiresBridge
    ? 'Technical bridge warning required.'
    : lab.difficulty === 'safe'
      ? 'Simulation only; no live wallet or assets.'
      : 'Guided readiness checks only.'
}));

export const adminPilotSessionTemplates: AdminPilotSession[] = sparkWorkshops.map((workshop) => ({
  id: workshop.id,
  title: workshop.title,
  format: workshop.format,
  schedule: workshop.date,
  capacity: workshop.capacity,
  participantCount: null,
  status: 'planned'
}));

export const adminRoadmapModules: AdminRoadmapModule[] = [
  { id: 'network', title: 'Starknet Network Module', status: 'planned', detail: 'Read-only network orientation and status.' },
  { id: 'cairo', title: 'Cairo Intro Module', status: 'available', detail: 'Introductory lesson content is published.' },
  { id: 'scarb', title: 'Scarb Module', status: 'future', detail: 'Builder tooling track; no runtime integration.' },
  { id: 'foundry', title: 'Starknet Foundry Module', status: 'future', detail: 'Builder testing track; no runtime integration.' },
  { id: 'wallet-safety', title: 'Wallet Safety Module', status: 'available', detail: 'Safety education and simulation content is published.' },
  { id: 'passport-proof', title: 'Passport Proof / Badge Roadmap', status: 'planned', detail: 'Offchain evidence first; no onchain badge claim.' },
  { id: 'utility', title: 'Payment / Service / Merchant Utility Roadmap', status: 'future', detail: 'Roadmap only; no payment or transaction flow.' }
];

export const adminSafetyChecklist = [
  'No wallet auto-connect',
  'No signature prompt',
  'No transaction prompt',
  'No seed phrase or private key handling',
  'No public editor route'
] as const;

export function findAdminLessonCatalog(slug: string) {
  return adminLessonCatalog.find((lesson) => lesson.slug === slug);
}

export function findAdminLabCatalog(id: string) {
  return adminLabCatalog.find((lab) => lab.id === id);
}
