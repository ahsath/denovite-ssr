import { createApp, createSSRApp } from "vue";
import { componentsMap } from "./main.ts";

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

      // **Check for the client-only marker attribute**
      const isClientOnly = component.hasAttribute("data-client-only");

      // Dynamically import the component module (this is where the JS file is fetched)
      const componentModule = await importComponent();
      const Component = componentModule.default || componentModule; // Get the component definition

      let app;
      if (isClientOnly) {
        // If the component is client-only, use createApp
        app = createApp(Component, propsData);
      } else {
        // For SSR-hydrated components, use createSSRApp
        app = createSSRApp(Component, propsData);
      }

      // Optional: Add any component-specific plugins or context needed client-side
      // app.use(...)
      // app.provide(...)

      app.mount(component);

      console.log(
        `[Hydrator] Hydrated ${
          isClientOnly ? "client-only" : "SSR"
        } component: ${componentName}`,
        {
          props: propsData,
          elementId: component.id,
        }
      );
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
