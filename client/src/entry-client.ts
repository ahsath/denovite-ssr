import { createApp, createSSRApp } from "vue";
import { componentsMap } from "./main.ts";
import "./assets/css/main.css";
import "./assets/css/HelloWorld.css";

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

      // Only print hydration info in development mode
      if (import.meta.env?.MODE === "development") {
        const type = isClientOnly ? "Client-Only" : "SSR";
        const typeStyle = isClientOnly
          ? "color: #ffb86c; background: #282a36; font-weight: bold; padding: 2px 6px; border-radius: 3px;"
          : "color: #8be9fd; background: #282a36; font-weight: bold; padding: 2px 6px; border-radius: 3px;";
        const idInfo = component.id ? ` (id: #${component.id})` : "";
        console.log(
          "%c[Hydrator]%c Hydrated %c%s%c component: %c%s%c%s",
          "color: #6272a4; font-weight: normal;",
          "color: #50fa7b; font-weight: bold;",
          typeStyle,
          type,
          "color: inherit; font-weight: normal;",
          "color: #f1fa8c; font-weight: bold;",
          componentName,
          "color: #44475a; font-style: italic;",
          idInfo
        );
        if (Object.keys(propsData).length > 0) {
          console.log("%c[Hydrator]   props:", "color: #6272a4;", propsData);
        }
      }
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
