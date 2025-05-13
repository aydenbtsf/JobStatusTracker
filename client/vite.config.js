import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vitejs.dev/config/
export default ({ mode }) => {
  // Get the Replit domain from the environment
  const env = loadEnv(mode, process.cwd(), "");

  return defineConfig({
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5000,
      strictPort: true,
      cors: {
        origin: "*",
      },
      watch: {
        usePolling: true,
      },
      allowedHosts: [
        "5ed1e1d0-97ef-4aad-982a-cd7dde3397e5-00-3ue6xnv29wn7b.janeway.replit.dev",
      ],
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          secure: false,
        },
      },
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom", "@mui/material"],
          },
        },
      },
    },
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
        "@shared": resolve(__dirname, "..", "shared"),
        "@assets": resolve(__dirname, "..", "attached_assets"),
      },
    },
  });
};
