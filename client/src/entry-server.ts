import { createSSRApp, type Component } from "vue";
import { renderToString, type SSRContext } from "@vue/server-renderer";

import TestIsland from "./components/TestIsland.vue";
import TestIsland2 from "./components/TestIsland2.vue";

// Map component names (used in data-component) to their component modules
const componentsMap: Record<string, Component> = {
  TestIsland,
  TestIsland2,
};
interface Props {
  [key: string]: unknown;
}

interface SSRCtx {
  teleports?: SSRContext["teleports"];
  modules: Set<string>;
}

interface RenderOptions {
  componentName: string;
  props?: Props;
  isClientOnly?: boolean;
  ctx?: SSRCtx;
}

interface RenderResult {
  html: string;
  ctx: SSRCtx;
}

// Function to render a specific component to an HTML string
export async function render(options: RenderOptions): Promise<RenderResult> {
  const {
    componentName,
    props = {},
    isClientOnly = Deno.env.get("NODE_ENV") === "development",
  } = options;
  const Component = componentsMap[componentName];

  if (!Component) {
    throw new Error(
      `[SSR] Component "${componentName}" not found in server map.`
    );
  }

  const propsJsonString = JSON.stringify(props);

  if (isClientOnly) {
    return {
      html: `<div data-component="${componentName}" data-props='${propsJsonString}' data-client-only="true"></div>`,
      ctx: { modules: new Set() },
    };
  }

  try {
    const ctx: SSRCtx = { modules: new Set() };
    const app = createSSRApp(Component, props);
    const innerHtml = await renderToString(app, ctx);

    // Return the full div structure that the client hydrator will find
    // Ensure the data attributes match what your client hydrator looks for
    return {
      html: `<div data-component="${componentName}" data-props='${propsJsonString}'>${innerHtml}</div>`,
      ctx,
    };
  } catch (error) {
    throw new Error(`[SSR] Error rendering "${componentName}": ${error}`);
  }
}

export type Render = typeof render;
