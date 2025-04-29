import { createSSRApp, type Component } from "vue";
import { renderToString } from "@vue/server-renderer";

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

// Function to render a specific component to an HTML string
export async function render(
  componentName: string,
  props: Props = {},
  isClientOnly: boolean = Deno.env.get("NODE_ENV") === "development"
): Promise<string> {
  const Component = componentsMap[componentName];

  if (!Component) {
    console.error(
      `[SSR] Component "${componentName}" not found in server map.`
    );
    return ``;
  }

  const propsJsonString = JSON.stringify(props);

  if (isClientOnly) {
    return `<div data-component="${componentName}" data-props='${propsJsonString}' data-client-only="true"></div>`;
  }

  try {
    const app = createSSRApp(Component, props);
    const ctx = {};
    const innerHtml = await renderToString(app, ctx);
    console.log(ctx);

    // Return the full div structure that the client hydrator will find
    // Ensure the data attributes match what your client hydrator looks for
    return `<div data-component="${componentName}" data-props='${propsJsonString}'>${innerHtml}</div>`;
  } catch (error) {
    console.error(`[SSR] Error rendering "${componentName}":`, error);
    return ``;
  }
}

export type Render = typeof render;
