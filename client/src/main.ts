// Consolidate the componentsMap into a separate file for reuse
export const componentsMap: Record<string, () => Promise<any>> = {
  TestIsland: () => import("./components/TestIsland.vue"),
  TestIsland2: () => import("./components/TestIsland2.vue"),
};
