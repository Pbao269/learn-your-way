import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, '../extension'),
  publicDir: false,
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: resolve(__dirname, '../extension/sidepanel.html'),
      output: {
        entryFileNames: 'sidepanel.js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'main.css') return 'sidepanel.css';
          if (assetInfo.name?.endsWith('.html')) return 'sidepanel.html';
          return assetInfo.name || '[name].[ext]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../extension'),
    },
  },
  base: './', // Use relative paths instead of absolute
});

