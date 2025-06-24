// Consolidate the componentsMap into a separate file for reuse
export const componentsMap: Record<string, () => Promise<any>> = {
  App: () => import("./App.vue"),
  HelloWorld: () => import("./components/HelloWorld.vue"),
};
