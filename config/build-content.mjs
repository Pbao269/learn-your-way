import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

build({
  entryPoints: [resolve(__dirname, '../extension/content.ts')],
  bundle: true,
  outfile: resolve(__dirname, '../dist/content.js'),
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  minify: true,
}).catch(() => process.exit(1));

