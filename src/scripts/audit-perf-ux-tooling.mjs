import fs from 'node:fs';

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const expected = ['@tanstack/svelte-query', '@tanstack/svelte-virtual', 'gsap'];
const expectedDev = ['@vite-pwa/sveltekit', 'vite-imagetools'];

const missing = expected.filter((name) => !pkg.dependencies?.[name]);
const missingDev = expectedDev.filter((name) => !pkg.devDependencies?.[name]);

if (missing.length || missingDev.length) {
  throw new Error(`Missing PERF-UX tooling: ${[...missing, ...missingDev].join(', ')}`);
}

console.log('PERF-UX tooling audit passed.');
