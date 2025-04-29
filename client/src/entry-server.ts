import { createSSRApp, type Component } from "vue";
import { renderToString } from "@vue/server-renderer";

import TestIsland from "./components/TestIsland.vue";

// Map component names (used in data-component) to their component modules
const componentsMap: Record<string, Component> = {
  TestIsland, // 'TestIsland' maps to the imported TestIsland component
};

// Define a type for props, adjust according to your actual props requirements
interface Props {
  [key: string]: unknown; // Or define specific properties if known
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
    // Create a minimal createSSRApp instance for this *single* component
    const app = createSSRApp(Component, props);
    const innerHtml = await renderToString(app);

    // Return the full div structure that the client hydrator will find
    // Ensure the data attributes match what your client hydrator looks for
    return `<div data-component="${componentName}" data-props='${propsJsonString}'>${innerHtml}</div>`;

    // Render this minimal app instance to an HTML string
    // const html = await renderToString(app);

    // return html; // Return the SSR'd HTML for the component
  } catch (error) {
    console.error(`[SSR] Error rendering "${componentName}":`, error);
    return ``;
  }
}

export type Render = typeof render;
