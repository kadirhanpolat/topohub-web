import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';

execSync('tsc --module es2022 --outDir dist/esm/', { stdio: 'inherit' });
mkdirSync('dist/esm', { recursive: true });
writeFileSync('dist/esm/package.json', JSON.stringify({ type: 'module' }) + '\n');

execSync('tsc --module commonjs --outDir dist/cjs/', { stdio: 'inherit' });
mkdirSync('dist/cjs', { recursive: true });
writeFileSync('dist/cjs/package.json', JSON.stringify({ type: 'commonjs' }) + '\n');
