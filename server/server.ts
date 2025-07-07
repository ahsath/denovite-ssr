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

function loadManifest(filename: string) {
  if (!prod) return {};
  const filePath = resolve(root, filename);
  return JSON.parse(Deno.readTextFileSync(filePath));
}

const ssrManifest = loadManifest("dist/.vite/ssr-manifest.json");

const liquid = new Liquid({
  extname: ".liquid",
  outputEscape: "escape",
  orderedFilterParameters: true,
  jsTruthy: true,
  cache: prod,
  globals: {
    prod,
    manifest: loadManifest("dist/.vite/manifest.json"),
  },
});

const app = express();
app.engine("liquid", liquid.express());
const viewPaths = ["views/pages", "views/layouts", "views/partials"];
app.set(
  "views",
  viewPaths.map((viewPath) => resolve(__dirname, viewPath))
);
app.set("view engine", "liquid");

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
  const module = await import(
    resolve(root, "dist/entry-server/entry-server.js")
  );
  render = module.render;

  app.use(express.static(resolve(root, "dist")));
}

app.use(express.static(resolve(root, "public")));

app.get("/", async (_req, res, next) => {
  try {
    const { results, preloadLinks } = await render({
      components: [{ componentName: "App" }],
      ssrManifest,
    });

    res.render(
      "index",
      {
        App: results.App.html,
      },
      async (err, html) => {
        if (err) {
          console.error("Liquid rendering error:", err);
          res.status(500).send("Error rendering home page");
        }

        if (!prod) {
          html = await vite.transformIndexHtml(_req.originalUrl, html);
        }

        html = html.replace("<!-- preload-links -->", preloadLinks);

        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      }
    );
  } catch (e) {
    if (e instanceof Error && vite && vite.ssrFixStacktrace) {
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
