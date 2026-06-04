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
      output: {
        entryFileNames: "assets/index.js",
        chunkFileNames: "assets/chunks/[name].js",
        assetFileNames: (info) => {
          const name = info.names?.[0] ?? "";
          if (name.endsWith(".css")) return "assets/css/app.css";
          return "assets/[name][extname]";
        },
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/gql": "http://localhost:4000",
      "/auth": "http://localhost:4000",
      "/rpc": "http://localhost:4000",
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
