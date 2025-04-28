Providing a _truly_ full, runnable example that includes all build configurations, dependencies, and both architectures is quite extensive for this format. It would involve setting up multiple entry points in Vite, complex server-side rendering logic, build scripts, etc.

However, I can provide a **more comprehensive conceptual example** by showing the key files and their relevant code snippets, illustrating how the different parts connect based on the architecture we've discussed.

This is **not a copy-paste runnable project**, but it shows the structure and the core logic in the critical files.

**Directory Structure:**

(Based on the structure we refined earlier)

```
my-project/
├── deno.json             <-- Deno config, tasks, import maps
├── deno.lock             <-- Deno's dependency lock file
├── package.json          <-- (Keep if using npm: imports)
├── README.md
├── public/               <-- Static assets
│   └── ...
├── server/               <-- All server-side code
│   ├── server.ts         <-- Main Deno/Express entry point
│   ├── views/            <-- LiquidJS templates
│   │   ├── admin_index.liquid  <-- Admin SPA base template
│   │   ├── layouts/
│   │   │   └── main.liquid   <-- Storefront base layout
│   │   └── pages/
│   │       └── product-detail.liquid <-- Storefront page template using islands
│   └── ... (other server modules)
├── client/               <-- All Vue client code and Vite build config
│   ├── src/              <-- Vue source code
│   │   ├── admin/
│   │   │   └── AdminApp.vue  <-- Admin SPA root component
│   │   ├── components/       <-- Reusable Vue components (including islands)
│   │   │   ├── ProductAddToCart.vue  <-- Example island
│   │   │   └── ProductReviews.vue    <-- Example island
│   │   ├── entry-admin.ts    <-- Admin SPA client entry
│   │   ├── entry-client-islands.ts <-- Storefront island hydrator entry
│   │   ├── entry-server-islands.ts <-- Storefront SSR render entry
│   │   └── ... (other shared client files)
│   ├── tsconfig.json     <-- Client base tsconfig
│   ├── tsconfig.app.json <-- Client app tsconfig
│   ├── vite.config.ts    <-- Vite configuration
│   └── ...
└── tsconfig.json         <-- (Optional) Root tsconfig
```

**Key File Snippets:**

**1. `deno.json`**

(Shows tasks and relevant npm imports)

```json
{
  "tasks": {
    "dev": "deno run -A npm:vite@^6.3.3 --config client/vite.config.ts",
    "build:client": "deno run -A npm:vite@^6.3.3 build --config client/vite.config.ts",
    "build:server": "deno run -A npm:vite@^6.3.3 build --ssr client/entry-server-islands.ts --outDir dist/server --config client/vite.config.ts",
    "build": "deno task build:client && deno task build:server",
    "start": "deno run -A server/server.ts",
    "ssr:dev": "deno run -A --watch server/server.ts"
  },
  "imports": {
    // npm packages used by both client and server
    "vue": "npm:vue@^3.5.13",
    "express": "npm:express@^5.1.0",
    "liquidjs": "npm:liquidjs@^10.21.0",
    "vite": "npm:vite@^6.3.3",

    // @types for npm packages
    "@types/express": "npm:@types/express@^5.1.0",

    // Vite plugins and specific Vue packages needed for build/ssr
    "@vitejs/plugin-vue": "npm:@vitejs/plugin-vue@^5.2.3",
    "@vue/tsconfig": "npm:@vue/tsconfig@^0.7.0",
    "vue-tsc": "npm:vue-tsc@^2.2.10",
    "@vue/server-renderer": "npm:@vue/server-renderer@^3.5.13", // Used on server for SSR

    // Node.js built-ins used via Deno's compatibility layer
    "node:path": "node:path",
    "node:url": "node:url",
    "node:fs": "node:fs"
  },
  "nodeModulesDir": "auto",
  "compilerOptions": {
    "types": ["npm:@types/express"],
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve" // Needed for Vue SFCs
  }
}
```

**2. `client/vite.config.ts`**

(Configures builds for Admin SPA, Storefront Client Hydrator, and Storefront SSR Server Entry)

```typescript
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "node:path";

const __dirname = new URL(".", import.meta.url).pathname; // Get current dir in Deno context

export default defineConfig({
  root: __dirname, // The client folder is the root for this Vite config
  plugins: [vue()],
  build: {
    // Output to a 'dist' folder OUTSIDE the client folder, at the project root level
    outDir: "../dist",
    emptyOutDir: true, // Clean dist folder on build

    rollupOptions: {
      input: {
        // Storefront Island Hydrator Client Entry
        "client-islands": resolve(__dirname, "src/entry-client-islands.ts"),
        // Admin SPA Client Entry
        "admin-spa": resolve(__dirname, "src/entry-admin.ts"),
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
  // SSR specific options (primarily for the 'build:server' task)
  ssr: {
    // List dependencies that should NOT be bundled into the SSR server code
    external: [
      "express",
      "liquidjs",
      "node:path",
      "node:url",
      "node:fs" /* ... other server-only deps */,
    ],
    noExternal: /vue/, // By default, framework deps might be externalized, ensure vue is processed
  },
  // Resolve aliases if needed
  resolve: {
    alias: {
      // Example: resolve('client/src') might be needed if you move this config
    },
  },
});
```

**3. `server/views/admin_index.liquid`**

(Basic template for the Admin SPA)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Admin | My CMS</title>
    {% comment %} Vite will inject CSS links here in dev, or you link built CSS
    in prod {% endcomment %}
  </head>
  <body>
    <div id="app"></div>
    {# Vue app mount point #} {% comment %} Vite will inject the script link
    here in dev, or you link built JS in prod {% endcomment %} {# In production,
    you'd link the specific admin-spa bundle like:
    <script type="module" src="/admin/admin-spa/admin-spa-[hash].js"></script>
    #}
  </body>
</html>
```

**4. `client/src/entry-admin.ts`**

(Admin SPA client entry point)

```typescript
import { createApp } from "vue";
import AdminApp from "./admin/AdminApp.vue"; // Root component for admin

const app = createApp(AdminApp);

// Set up client-side router if using Vue Router
// import router from './admin/admin-router'; // Create this file
// app.use(router);

app.mount("#app");

console.log("Admin SPA mounted!");
```

**5. `server/views/pages/product-detail.liquid`**

(Storefront page template with island placeholders)

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{ product.title }} | My Store</title>
    {% comment %} Link to main CSS assets {% endcomment %} {# In production,
    link to Vite-built main CSS:
    <link rel="stylesheet" href="/client-islands/client-islands-[hash].css" />
    #}
  </head>
  <body>
    {% include 'layouts/main' %} {# Include a main layout if you have one #}

    <h1>{{ product.title }}</h1>
    <img src="{{ product.imageUrl }}" alt="{{ product.title }}" />

    <div class="product-info">
      <p>{{ product.description }}</p>

      {# Island 1: Add to Cart Button #} {# This div acts as the container and
      marker for the client-side hydrator #}
      <div
        id="add-to-cart-island-{{ product.id }}"
        data-component="ProductAddToCart"
        data-props='{ "productId": {{ product.id | json }} }'
        {#
        Pass
        data
        as
        JSON
        attribute
        #}
        data-ssr-html="{{ productAddToCartHtml }}"
        {#
        Placeholder
        for
        SSR
        HTML
        from
        server
        #}
      >
        {# Server will inject the SSR'd HTML here inside this div #} {% raw %}{{
        productAddToCartHtml }}{% endraw %}
      </div>

      {# Island 2: Product Reviews #}
      <div
        id="product-reviews-island-{{ product.id }}"
        data-component="ProductReviews"
        data-props="{{ product.reviews | json }}"
        {#
        Pass
        data
        as
        JSON
        attribute
        #}
        data-ssr-html="{{ productReviewsHtml }}"
        {#
        Placeholder
        for
        SSR
        HTML
        #}
      >
        {# Server will inject the SSR'd HTML here inside this div #} {% raw %}{{
        productReviewsHtml }}{% endraw %}
      </div>
    </div>

    {% comment %} Link to the client-side Island Hydrator script {% endcomment
    %} {# In development, Vite injects the script. In production, link built JS:
    <script
      type="module"
      src="/client-islands/client-islands-[hash].js"
    ></script>
    #}
  </body>
</html>
```

_Note: The `data-ssr-html` attribute isn't strictly necessary if you inject the HTML directly inside the container. The key is the `data-component` and `data-props` for the client hydrator._

**6. `client/src/entry-server-islands.ts`**

(Storefront SSR entry point - exports render functions for islands)

```typescript
// This file is used by the 'deno task build:server' command and by server/server.ts in dev SSR

import { renderToString as vueRenderToString } from "@vue/server-renderer";
import { createApp, h } from "vue";

// Import your island components
import ProductAddToCart from "./components/ProductAddToCart.vue";
import ProductReviews from "./components/ProductReviews.vue";

// Map component names (used in data-component attribute and server render call)
// to the actual component modules.
const componentsMap: Record<string, any> = {
  ProductAddToCart,
  ProductReviews,
  // Add other island components here
};

// Function to render a specific island component to an HTML string
export async function renderIsland(
  componentName: string,
  props: any = {}
): Promise<string> {
  const Component = componentsMap[componentName];
  if (!Component) {
    console.error(`[SSR] Island component "${componentName}" not found.`);
    // Return a fallback or empty string, or throw
    return ``;
  }

  try {
    // Create a minimal Vue app instance just to render this one component
    const app = createApp({
      render: () => h(Component, props), // Use h function to render the component with props
    });

    // Optional: Add any necessary global properties, plugins, etc. that the component needs
    // app.provide(...)
    // app.use(...)

    // Render the component to an HTML string
    const html = await vueRenderToString(app);

    // Return the rendered HTML. The server/server.ts will inject this into the Liquid template.
    return html;
  } catch (error) {
    console.error(`[SSR] Error rendering island "${componentName}":`, error);
    // Handle rendering errors appropriately
    return ``;
  }
}

// If you have any shared state or context for islands, you might export other things too
// export { componentsMap }; // Might be useful for client hydrator dynamic import mapping
```

**7. `client/src/entry-client-islands.ts`**

(Storefront client-side script to find and hydrate islands)

```typescript
import { createApp, h } from "vue";
import { hydrate } from "vue/runtime-core"; // For hydration in Vue 3 composition API context

// Map component names (from data-component attribute) to dynamic imports
// This allows code splitting - the client only loads the JS for islands present on the page
const componentsMap: Record<string, () => Promise<any>> = {
  ProductAddToCart: () => import("./components/ProductAddToCart.vue"),
  ProductReviews: () => import("./components/ProductReviews.vue"),
  // Add other island components here
};

async function hydrateIslands() {
  // Find all elements marked as islands by the server
  const islands = document.querySelectorAll("[data-component]");

  for (const islandElement of Array.from(islands)) {
    const componentName = islandElement.getAttribute("data-component");

    if (!componentName || !componentsMap[componentName]) {
      console.warn(
        `[Hydrator] Unknown or missing island component: ${componentName}`
      );
      continue; // Skip if component name is missing or not mapped
    }

    try {
      // Read the initial props data from the data attribute
      const propsDataAttr = islandElement.getAttribute("data-props");
      const propsData = propsDataAttr ? JSON.parse(propsDataAttr) : {};

      // Dynamically import the component module
      const componentModule = await componentsMap[componentName]();
      const Component = componentModule.default || componentModule; // Handle default exports

      // Create a Vue app instance for this specific island
      const app = createApp({
        // The render function creates the VNode for the island component with props
        render: () => h(Component, propsData),
      });

      // Optional: Add any global properties or plugins needed by islands here
      // app.provide(...)
      // app.use(...)

      // Mount the app to the island element. Vue will attempt to hydrate if SSR HTML is present.
      // The `true` argument in mount is crucial for triggering hydration in Vue 3's compat mode,
      // or you might use `app.mount(islandElement)` which hydrates by default if matching VNodes/DOM are found.
      // The best approach depends slightly on your exact Vue/Vite/SSR setup and version.
      app.mount(islandElement, true); // Hydrate the island at its location

      console.log(`[Hydrator] Hydrated island: ${componentName}`);
    } catch (error) {
      console.error(
        `[Hydrator] Error hydrating island "${componentName}":`,
        error
      );
      // Handle hydration errors
    }
  }
}

// Run the hydration process once the DOM is ready
// Use appropriate lifecycle hook depending on your setup (e.g., DOMContentLoaded)
window.addEventListener("DOMContentLoaded", hydrateIslands);
// Or for more advanced scenarios, check document.readyState
// if (document.readyState === 'loading') {
//   document.addEventListener('DOMContentLoaded', hydrateIslands);
// } else {
//   hydrateIslands();
// }
```

**8. `server/server.ts` (Storefront Route Example)**

(Shows the integration of LiquidJS and Vue SSR Island rendering)

```typescript
import { createServer } from "vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import express from "express";
import { Liquid } from "liquidjs";
import fs from "node:fs";

// Import renderIsland function type for type checking
import type { renderIsland as RenderIslandFn } from "../client/src/entry-server-islands";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");

const isProduction = process.env.NODE_ENV === "production";

let vite: any;
let renderIsland: RenderIslandFn; // Declare variable for the render function

async function setupServer() {
  if (!isProduction) {
    vite = await createServer({
      root: projectRoot,
      configFile: "client/vite.config.ts",
      server: { middlewareMode: true },
      appType: "custom", // Use 'custom' for SSR setup
    });

    // In development, load the SSR render function directly from Vite's module graph
    // '/client/src/entry-server-islands.ts' is the path relative to the Vite root (projectRoot)
    const ssrEntry = await vite.ssrLoadModule(
      "/client/src/entry-server-islands.ts"
    );
    renderIsland = ssrEntry.renderIsland;
  } else {
    // In production, import the pre-built SSR bundle
    // Adjust the path to wherever your 'deno task build:server' outputs the SSR entry
    const ssrEntry = await import(
      resolve(projectRoot, "dist/server/entry-server-islands.js")
    );
    renderIsland = ssrEntry.renderIsland;
  }

  const app = express();
  const liquidEngine = new Liquid({
    root: resolve(__dirname, "views"),
    extname: ".liquid",
  });

  // Serve static assets (Vite middleware in dev, express.static in prod)
  if (!isProduction) {
    app.use(vite.middlewares);
  } else {
    // Serve client build output (adjust path if needed)
    app.use(express.static(resolve(projectRoot, "dist/client-islands"))); // Static for storefront islands client assets
    app.use("/admin", express.static(resolve(projectRoot, "dist/admin-spa"))); // Static for admin SPA assets
    // You might need other static asset routes for main public/ folder etc.
  }

  // --- Admin SPA Route ---
  app.get("/admin*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const templatePath = resolve(__dirname, "views/admin_index.liquid");
      const liquidTemplateContent = fs.readFileSync(templatePath, "utf-8");
      let html = await liquidEngine.parseAndRender(liquidTemplateContent, {});

      if (!isProduction) {
        // Transform the rendered Liquid HTML with Vite for dev/HMR
        html = await vite.transformIndexHtml(url, html);
      }
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e: any) {
      if (!isProduction) vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  // --- Storefront Product Detail Route ---
  app.get("/products/:handle", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      // 1. Fetch Data (Example: replace with your data fetching logic)
      const productHandle = req.params.handle;
      // Simulate fetching product data
      const product = {
        id: 123,
        handle: productHandle,
        title: `Product: ${productHandle.replace("-", " ")}`,
        description: `Details for ${productHandle}`,
        imageUrl: "/public/product-image.jpg", // Example static asset
        reviews: [
          { id: 1, text: "Great product!" },
          { id: 2, text: "Loved it!" },
        ],
      };
      if (!product) {
        // Handle product not found
        return res.status(404).send("Product not found");
      }
      const pageData = { product }; // Data to pass to Liquid

      // 2. Load the LiquidJS page template
      const templatePath = resolve(
        __dirname,
        "views/pages/product-detail.liquid"
      );
      const liquidTemplateContent = fs.readFileSync(templatePath, "utf-8");

      // 3. Render Vue SSR Islands required on this page
      // Use the renderIsland function loaded from the SSR entry
      const productAddToCartHtml = await renderIsland("ProductAddToCart", {
        productId: product.id,
      });
      const productReviewsHtml = await renderIsland("ProductReviews", {
        reviews: product.reviews,
      }); // Pass data as props

      // 4. Render the LiquidJS template, passing both page data AND rendered island HTML strings
      let html = await liquidEngine.parseAndRender(liquidTemplateContent, {
        ...pageData, // Data for Liquid template variables
        productAddToCartHtml: productAddToCartHtml, // Inject SSR output for add-to-cart island
        productReviewsHtml: productReviewsHtml, // Inject SSR output for reviews island
        // You also need to pass serialized props data to the Liquid template
        // so the client-side hydrator can read it from data-props attributes
        productReviewsPropsJson: JSON.stringify(product.reviews),
      });

      // 5. Apply Vite HTML transforms (in development only)
      if (!isProduction) {
        // Pass the full rendered HTML (with SSR islands injected) to Vite
        html = await vite.transformIndexHtml(url, html);
      } else {
        // In production, ensure asset paths are correct (via build manifest etc.)
        // This step might involve reading .vite/manifest.json and replacing asset URLs in the HTML
      }

      // 6. Send the final HTML response
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e: any) {
      if (!isProduction) vite!.ssrFixStacktrace(e); // Use Vite's helper in dev
      next(e); // Pass error to Express error handler
    }
  });

  // --- Other Storefront Routes (e.g., homepage, collections) would follow a similar pattern ---
  app.get("/", async (req, res, next) => {
    // ... fetch data, render LiquidJS template (e.g., home.liquid)
    // ... render any islands needed on the homepage
    // ... inject SSR output into Liquid
    // ... transform with Vite (dev)
    // ... send HTML
  });

  // Serve static assets from the 'public' folder
  app.use(express.static(resolve(projectRoot, "public")));

  // Basic Error Handler
  app.use(
    (
      err: any,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  );

  app.listen(3000, () => {
    console.log(
      `Server listening on http://localhost:3000 (Production: ${isProduction})`
    );
  });
}

setupServer().catch(console.error);
```

This setup provides the core logic for both architectures within a single Express server:

- The `/admin` route serves a simple HTML base from Liquid and relies entirely on client-side Vue for the SPA.
- Storefront routes render the main page structure and static content using LiquidJS, but also call Vue SSR functions (`renderIsland`) to get the HTML for interactive components and inject it _into_ the Liquid output before sending it to the client. The client-side `entry-client-islands.ts` then makes these SSR-rendered components interactive.

```json
{
  "tasks": {
    // Task to run the Vite development server (often needs to be run separately)
    "client:dev": "deno run -A npm:vite@^6.3.3 build --config client/vite.config.ts",

    // Task to run the Deno server in DEVELOPMENT mode with watch
    "server:dev": "NODE_ENV=development deno run -A --watch server/server.ts",

    // Task to run the Deno server in PRODUCTION mode (run after build)
    "server:prod": "NODE_ENV=production deno run -A server/server.ts",

    // Build tasks remain the same
    "build:client": "deno run -A npm:vite@^6.3.3 build --config client/vite.config.ts --manifest",
    "build:server": "deno run -A npm:vite@^6.3.3 build --ssr client/entry-server-islands.ts --outDir dist/server --config client/vite.config.ts",
    "build": "deno task build:client && deno task build:server",

    // Optional: a single task to run both client and server in dev
    "dev": "deno task client:dev & deno task server:dev" // Use '&' or '&&' depending on desired behavior
  }
  // ... rest of your deno.json
}
```
