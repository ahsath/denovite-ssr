import { renderToString } from "@vue/server-renderer"; // Import the server renderer from Vue
import { createSSRApp } from "vue";

// Import the island components you want to be able to SSR
import TestIsland from "./components/TestIsland.vue";
// import OtherIsland from './components/OtherIsland.vue'; // Import other islands

// Map component names (used in data-component) to their component modules
const componentsMap: Record<string, any> = {
  TestIsland, // 'TestIsland' maps to the imported TestIsland component
  // OtherIsland, // Add other islands here
};

// Function to render a specific island component to an HTML string
export async function render(
  componentName: string,
  props: any = {}
): Promise<string> {
  const Component = componentsMap[componentName];

  if (!Component) {
    console.error(
      `[SSR] Component "${componentName}" not found in server map.`
    );
    return ``;
  }

  try {
    // Create a minimal createSSRApp instance for this *single* component
    const app = createSSRApp(Component, props);

    // Render this minimal app instance to an HTML string using our mock renderer
    const html = await renderToString(app);

    return html; // Return the SSR'd HTML for the island
  } catch (error) {
    console.error(`[SSR] Error rendering "${componentName}":`, error);
    return ``;
  }
}

export type Render = typeof render;
