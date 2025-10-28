import { build } from 'esbuild';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

build({
  entryPoints: [resolve(__dirname, '../extension/service_worker.ts')],
  bundle: true,
  outfile: resolve(__dirname, '../dist/service_worker.js'),
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  minify: true,
}).catch(() => process.exit(1));

