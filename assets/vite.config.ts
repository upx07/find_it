import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), react()],
  build: {
    outDir: "../priv/static",
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      input: "./index.html",
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/gql": "http://localhost:4000",
      "/auth": "http://localhost:4000",
      "/rpc": "http://localhost:4000",
      "/api": "http://localhost:4000",
    },
  },
});
