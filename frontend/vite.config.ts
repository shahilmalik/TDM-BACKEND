import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const envDir = __dirname;
    const env = loadEnv(mode, envDir, '');
    return {
      envDir,
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      // No `define` needed for Gemini; access via `import.meta.env.VITE_GEMINI_API_KEY`
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
