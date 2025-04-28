import { defineConfig } from "npm:vite@6.3.3";
import vue from "npm:@vitejs/plugin-vue@5.2.3";
import { fromFileUrl, resolve, dirname } from "@std/path";

const __dirname = dirname(fromFileUrl(import.meta.url));

// https://vitejs.dev/config/
export default defineConfig({
  root: __dirname, // The client folder is the root for this Vite config
  build: {
    // Output to a 'dist' folder OUTSIDE the client folder, at the project root level
    outDir: "../dist",
    emptyOutDir: true, // Clean dist folder on build,

    rollupOptions: {
      input: {
        // Storefront Island Hydrator Client Entry
        client: resolve(__dirname, "src/entry-client.ts"),
        // Admin SPA Client Entry
        admin: resolve(__dirname, "src/entry-admin.ts"),
        // Storefront SSR Server Entry (handled by deno task build:server --ssr ...)
        // You don't list the SSR entry here in 'input' when using the --ssr flag like in deno.json task
      },
      output: {
        // Configure output paths to keep different bundles organized
        entryFileNames: "[name]/[name]-[hash].js",
        chunkFileNames: "[name]/[name]-[hash].js",
        assetFileNames: "[name]/[name]-[hash].[ext]",
        // You might need separate output config for the SSR build if not using --outDir
      },
    },
  },
  ssr: {
    // external: ["express", "liquidjs", "@vue/server-renderer"],
    // noExternal: [/vue/],
  },
  plugins: [vue()],
});
