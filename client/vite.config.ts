import { fromFileUrl, resolve, dirname } from "@std/path";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import tailwindcss from "@tailwindcss/vite";

const __dirname = dirname(fromFileUrl(import.meta.url));

export default defineConfig({
  root: __dirname, // The client folder is the root for this Vite config
  build: {
    // Output to a 'dist' folder OUTSIDE the client folder, at the project root level
    outDir: "../dist",
    emptyOutDir: true, // Clear the output directory before building

    rollupOptions: {
      input: {
        // Storefront Island Hydrator Client Entry
        client: resolve(__dirname, "src/entry-client.ts"),
        // Admin SPA Client Entry
        admin: resolve(__dirname, "src/entry-admin.ts"),
        // Common CSS file
        css: resolve(__dirname, "src/assets/main.css"),
      },
      output: {
        // Configure output paths to keep different bundles organized
        entryFileNames: (chunkInfo) => {
          // Prevent hashing for entry-server file
          if (chunkInfo.name === "entry-server") {
            return "[name].js";
          }
          return "[name]/[name]-[hash].js";
        },
        chunkFileNames: "[name]/[name]-[hash].js",
        assetFileNames: "[name]/[name]-[hash].[ext]",
      },
    },
  },
  plugins: [vue(), vueDevTools(), tailwindcss()],
});
