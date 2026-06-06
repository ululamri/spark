import { existsSync } from 'node:fs';

const forbidden = ['services/api/Cargo.toml', 'services/api/src/main.rs'];
const found = forbidden.filter((path) => existsSync(path));

if (found.length) {
  console.error('Backend files are still inside the frontend repo:');
  for (const path of found) console.error(`- ${path}`);
  process.exit(1);
}

console.log('Pass 45 clean frontend/backend boundary audit OK');
