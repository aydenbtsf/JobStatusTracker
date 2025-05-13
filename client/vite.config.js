import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Get the Replit domain from the environment
  const env = loadEnv(mode, process.cwd(), '');
  const replitDomain = '5ed1e1d0-97ef-4aad-982a-cd7dde3397e5-00-3ue6xnv29wn7b.janeway.replit.dev';
  
  return defineConfig({
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5000,
      strictPort: true,
      cors: {
        origin: '*',
      },
      hmr: {
        clientPort: 443
      },
      watch: {
        usePolling: true
      },
      proxy: {
        '/api': {
          target: 'http://localhost:8000',
          changeOrigin: true,
        }
      },
      fs: {
        strict: false,
        allow: ['.']
      },
      allowedHosts: [
        'localhost',
        '5ed1e1d0-97ef-4aad-982a-cd7dde3397e5-00-3ue6xnv29wn7b.janeway.replit.dev'
      ]
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@shared': resolve(__dirname, '..', 'shared'),
        '@assets': resolve(__dirname, '..', 'attached_assets'),
      },
    },
    // Explicitly allow the Replit domain
    base: './',
    define: {
      __ALLOWED_HOST__: JSON.stringify(replitDomain)
    }
  });
}