import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  root: resolve(__dirname, '../extension/sidepanel'),
  publicDir: false,
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, '../extension/sidepanel.html'),
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../extension'),
    },
  },
});

