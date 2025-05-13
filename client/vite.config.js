import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Get the Replit domain from the environment
  const env = loadEnv(mode, process.cwd(), '');
  
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
          secure: false,
        }
      },
    },
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', '@mui/material'],
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@shared': resolve(__dirname, '..', 'shared'),
        '@assets': resolve(__dirname, '..', 'attached_assets'),
      },
    },
  });
}