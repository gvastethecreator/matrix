import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    host: '127.0.0.1',
  },
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Three.js changes less often than the app, so its own chunk stays cached across deploys.
        codeSplitting: { groups: [{ name: 'three', test: /[\\/]node_modules[\\/]three[\\/]/ }] },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, '.'),
    },
  },
});
