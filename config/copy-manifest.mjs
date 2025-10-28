import { copyFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Copy manifest
copyFileSync(
  resolve(__dirname, '../extension/manifest.json'),
  resolve(__dirname, '../dist/manifest.json')
);

// Create icons directory
mkdirSync(resolve(__dirname, '../dist/icons'), { recursive: true });

// Copy icons
const icons = ['icon16.png', 'icon48.png', 'icon128.png'];
icons.forEach(icon => {
  copyFileSync(
    resolve(__dirname, `../extension/icons/${icon}`),
    resolve(__dirname, `../dist/icons/${icon}`)
  );
});

console.log('✓ Manifest and icons copied to dist/');

