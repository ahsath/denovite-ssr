import { createApp } from "vue"; // Need createApp and h for client mounting

// Map component names (from data-component) to DYNAMIC IMPORTS of the component modules
// This ensures code splitting - the browser only downloads the JS for islands that are on the page
const componentsMap: Record<string, () => Promise<any>> = {
  TestIsland: () => import("./components/TestIsland.vue"), // Dynamic import of the component
};

async function hydrate() {
  // Find all elements in the DOM marked as components
  const components = document.querySelectorAll("[data-component]");

  for (const component of Array.from(components)) {
    const componentName = component.getAttribute("data-component");

    const importComponent = componentsMap[componentName!]; // Get the dynamic import function
    if (!componentName || !importComponent) {
      console.warn(
        `[Hydrator] Unknown or missing component mapping: ${componentName}`
      );
      continue;
    }

    try {
      // Read the initial props data from the data attribute
      const propsDataAttr = component.getAttribute("data-props");
      // Use JSON.parse to convert the string attribute back to a JavaScript object
      const propsData = propsDataAttr ? JSON.parse(propsDataAttr) : {};

      // Dynamically import the component module (this is where the JS file is fetched)
      const componentModule = await importComponent();
      const Component = componentModule.default || componentModule; // Get the component definition

      // Create a minimal Vue app instance for *this specific element*
      // Although the SSR side used createSSRApp, createApp().mount(el, true) works for hydration
      // However, to be fully consistent with potential future needs (like per-component context/plugins),
      // you *could* create a small helper function similar to the factory idea, but using createApp
      // for client mounting if createSSRApp isn't strictly needed client-side.
      // For now, let's stick to the simplest mount:
      const app = createApp(Component, propsData);

      // Optional: Add any component-specific plugins or context needed client-side
      // app.use(...)
      // app.provide(...)

      // Mount the app instance to the component element.
      // Vue 3 automatically attempts hydration if the element has matching SSR'd content.
      app.mount(component); // No second argument needed

      console.log(`[Hydrator] Hydrated component: ${componentName}`, {
        props: propsData,
        elementId: component.id,
      });
    } catch (error) {
      console.error(
        `[Hydrator] Error hydrating component "${componentName}":`,
        error
      );
      // Handle hydration errors (e.g., component failed to load, props parsing failed)
    }
  }
}

// Run the hydration process once the DOM is ready
globalThis.addEventListener("DOMContentLoaded", hydrate);
