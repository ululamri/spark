#!/usr/bin/env node
import { readFileSync } from 'node:fs';

const text = readFileSync('src/routes/admin/moderation/+page.svelte', 'utf8');
const required = [
  "actor?.capabilities?.includes('ml_moderation_manage')",
  "actor?.capabilities?.includes('moderation_bulk')",
  '{#if canManageMl}',
  '{:else if canManageMl}',
  '{#if canRunBulk}',
  'ML actions are read-only',
  'Read-only for this role.',
  'Action forms are hidden unless the actor has the required backend capability.'
];

const blockers = required.filter((item) => !text.includes(item));
console.log('PASS 19C admin moderation capability UI audit');
if (blockers.length) {
  for (const item of blockers) console.error(`Missing ${item}`);
  process.exit(1);
}
console.log('No PASS 19C admin moderation capability UI blockers found.');
