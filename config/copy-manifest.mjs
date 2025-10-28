import { copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

copyFileSync(
  resolve(__dirname, '../extension/manifest.json'),
  resolve(__dirname, '../dist/manifest.json')
);

console.log('✓ Manifest copied to dist/');

