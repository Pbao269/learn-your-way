import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: resolve(__dirname, '../dist'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        sidepanel: resolve(__dirname, '../extension/sidepanel.html'),
        main: resolve(__dirname, '../extension/sidepanel/main.tsx'),
      },
      output: {
        entryFileNames: 'sidepanel.js',
        chunkFileNames: '[name].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'main.css') return 'sidepanel.css';
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
});

