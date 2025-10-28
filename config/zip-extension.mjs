import { execSync } from 'child_process';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = resolve(__dirname, '../dist');
const zipPath = resolve(__dirname, '../learnmyway-extension.zip');

try {
  execSync(`cd ${distPath} && zip -r ${zipPath} .`, { stdio: 'inherit' });
  console.log('✓ Extension packaged at learnmyway-extension.zip');
} catch (error) {
  console.error('Failed to create zip:', error);
  process.exit(1);
}

