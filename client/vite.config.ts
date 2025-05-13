import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from '@tailwindcss/vite';
import cartographer from '@replit/vite-plugin-cartographer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), cartographer()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
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