import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import { createGlyphsHandler } from './api/generateGlyphs.mjs';

const glyphsApi = (apiKey: string | undefined): Plugin => ({
  name: 'matrix-glyphs-api',
  configureServer(server) {
    server.middlewares.use('/api/glyphs', createGlyphsHandler({ apiKey }));
  },
});

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '127.0.0.1',
    },
    plugins: [react(), tailwindcss(), glyphsApi(env.GEMINI_API_KEY)],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
  };
});
