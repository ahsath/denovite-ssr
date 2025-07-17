import { createSSRApp } from "vue";
import { renderToString, type SSRContext } from "@vue/server-renderer";
import { componentsMap } from "./main.ts";

interface Props {
  [key: string]: unknown;
}

interface SSRCtx {
  teleports?: SSRContext["teleports"];
  modules: Set<string>;
}

interface RenderResult {
  html: string;
  ctx: SSRCtx;
}

export type Render = (options: {
  components: Array<{
    componentName: string;
    props?: Props;
    isClientOnly?: boolean;
  }>;
  ssrManifest: Record<string, string[]>;
}) => Promise<{
  results: { [componentName: string]: RenderResult };
  preloadLinks: string;
}>;

export const render: Render = async (options) => {
  const { components, ssrManifest } = options;
  const results: { [componentName: string]: RenderResult } = {};
  const allModules = new Set<string>();
  let allPreloadLinks = "";

  for (const { componentName, props = {}, isClientOnly } of components) {
    if (!componentsMap[componentName]) {
      throw new Error(
        `[SSR] Component "${componentName}" not found in componentsMap.`
      );
    }

    let Component = await componentsMap[componentName]();
    Component = Component.default || Component;

    if (!Component) {
      throw new Error(
        `[SSR] Component "${componentName}" could not be loaded.`
      );
    }

    const propsJsonString = JSON.stringify(props);

    if (
      isClientOnly === true ||
      (isClientOnly === undefined && Deno.env.get("NODE_ENV") === "development")
    ) {
      results[componentName] = {
        html: `<div data-component="${componentName}" data-props='${propsJsonString}' data-client-only="true"></div>`,
        ctx: { modules: new Set() },
      };
      continue;
    }

    try {
      const ctx: SSRCtx = { modules: new Set() };
      const app = createSSRApp(Component, props);
      const innerHtml = await renderToString(app, ctx);

      results[componentName] = {
        html: `<div data-component="${componentName}" data-props='${propsJsonString}'>${innerHtml}</div>`,
        ctx,
      };

      if (ctx && ctx.modules) {
        for (const mod of ctx.modules) {
          allModules.add(mod);
        }
      }
    } catch (error) {
      throw new Error(`[SSR] Error rendering "${componentName}": ${error}`);
    }
  }

  allPreloadLinks = renderPreloadLinks(allModules, ssrManifest);

  return { results, preloadLinks: allPreloadLinks };
};

function renderPreloadLinks(
  modules: SSRCtx["modules"],
  manifest: Record<string, string[]>
) {
  let links = "";
  const seen = new Set();
  modules.forEach((id) => {
    const files = manifest[id];
    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file);
          links += renderPreloadLink(file);
        }
      });
    }
  });
  return links;
}

function renderPreloadLink(file: string) {
  if (file.endsWith(".js")) {
    return `<link rel="modulepreload" crossorigin href="${file}">`;
  } else if (file.endsWith(".css")) {
    return `<link rel="stylesheet" href="${file}">`;
  } else if (file.endsWith(".woff")) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
  } else if (file.endsWith(".woff2")) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
  } else if (file.endsWith(".gif")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/gif">`;
  } else if (file.endsWith(".jpg") || file.endsWith(".jpeg")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`;
  } else if (file.endsWith(".png")) {
    return ` <link rel="preload" href="${file}" as="image" type="image/png">`;
  } else {
    // TODO
    return "";
  }
}
