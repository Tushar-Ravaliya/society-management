import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Listen on all network interfaces (needed inside Docker)
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // Enable file polling for HMR on Docker volumes
    },
  },
});
