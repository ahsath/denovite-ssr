import { fromFileUrl, resolve, dirname } from "@std/path";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import express from "express";
import { Liquid } from "liquidjs";
import type { Render } from "../client/src/entry-server.ts";

const prod = Deno.env.get("NODE_ENV") === "production";
const port = Deno.env.get("PORT") || 8080;
const __dirname = dirname(fromFileUrl(import.meta.url));
const root = resolve(__dirname, "..");
let vite: ViteDevServer;
let render: Render;
let manifest = prod
  ? JSON.parse(Deno.readTextFileSync(resolve(root, "dist/.vite/manifest.json")))
  : undefined;

const liquid = new Liquid({
  extname: ".liquid",
  outputEscape: "escape",
  orderedFilterParameters: true,
  jsTruthy: true,
  cache: prod,
  globals: {
    prod,
    manifest,
  },
});

const app = express();
app.engine("liquid", liquid.express());
const viewPaths = [
  "views/pages",
  "views/pages/store",
  "views/layouts",
  "views/partials",
];
app.set(
  "views",
  viewPaths.map((viewPath) => resolve(__dirname, viewPath))
);
app.set("view engine", "liquid");
// app.use(express.static(resolve(__dirname, "public")));

if (!prod) {
  vite = await createViteServer({
    root,
    configFile: "client/vite.config.ts",
    server: {
      middlewareMode: true,
      watch: {
        usePolling: true,
        interval: 100,
      },
    },
    appType: "custom",
  });

  const module = await vite.ssrLoadModule(
    resolve(root, "client/src/entry-server.ts")
  );
  render = module.render;

  app.use(vite.middlewares);
} else {
  const module = await import(resolve(root, "dist/server/entry-server.js"));
  render = module.render;

  try {
    const manifestPath = resolve(root, "dist/.vite/manifest.json");
    manifest = JSON.parse(await Deno.readTextFile(manifestPath));
    console.log("Loaded manifest.json for production build");
  } catch (error) {
    console.error("Failed to load manifest.json:", error);
  }

  app.use(express.static(resolve(root, "dist")));
}

// Home page route
app.get("/", async (_req, res, next) => {
  try {
    const {
      html,
      ctx: { modules },
    } = await render({
      componentName: "TestIsland",
      props: { islandId: 789, otherData: "..." },
    });

    res.render("index", { html, modules }, async (err, html) => {
      if (err) {
        console.error("Liquid rendering error:", err);
        res.status(500).send("Error rendering home page");
      }

      if (!prod) {
        html = await vite.transformIndexHtml(_req.originalUrl, html);
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    });
  } catch (e) {
    if (e instanceof Error) {
      vite.ssrFixStacktrace(e);
    }
    next(e);
  }
});

// Admin SPA route
app.get("/admin", (req, res, next) => {
  try {
    res.render("admin", {}, async (err, html) => {
      if (err) {
        res.status(500).send("Error rendering admin page");
      }

      if (!prod) {
        html = await vite.transformIndexHtml(req.originalUrl, html);
      }

      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    });
  } catch (e) {
    if (e instanceof Error) {
      vite.ssrFixStacktrace(e);
    }
    next(e);
  }
});

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
