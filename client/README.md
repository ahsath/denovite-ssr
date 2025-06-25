# Frontend (`client/`): Vite + Vue 3 + TypeScript

This directory contains the frontend code for your project, built with [Vue 3](https://vuejs.org/), [Vite](https://vitejs.dev/), and TypeScript. It is designed for fast development, hot module replacement, and seamless integration with server-side rendering (SSR).

---

## Directory Structure

```
client/
├── src/
│   ├── App.vue                # Main Vue app component
│   ├── main.ts                # App entry point for the browser
│   ├── entry-client.ts        # Vite client entry for SSR hydration
│   ├── entry-server.ts        # Vite server entry for SSR rendering
│   ├── components/
│   │   └── HelloWorld.vue     # Example Vue component
│   └── assets/
│       ├── css/
│       │   ├── main.css       # Global styles
│       │   └── HelloWorld.css # Example component styles
│       └── svg/
│           ├── deno.svg
│           ├── vite.svg
│           └── vue.svg
├── vite.config.ts             # Vite configuration (plugins, build output, SSR)
├── tsconfig.json              # TypeScript project references
├── tsconfig.app.json          # TypeScript config for app source
├── tsconfig.node.json         # TypeScript config for Vite config and tooling
```

---

## Key Files & Configs

### `vite.config.ts`

- Sets up Vite for Vue 3, Tailwind CSS, and Vue DevTools.
- Configures build output to the project root `dist/` folder.
- Handles SSR entry points and output file naming.

### `tsconfig.json`

- Project references for TypeScript, pointing to `tsconfig.app.json` and `tsconfig.node.json`.

### `tsconfig.app.json`

- Extends Vue's recommended config.
- Enables strict type checking and includes all `.ts` and `.vue` files in `src/`.

### `tsconfig.node.json`

- Used for Vite and tooling scripts.
- Targets modern JavaScript, enables strict mode, and disables emitting output.

---

## Source Code

- **`App.vue`**: Main application shell, imports and displays the `HelloWorld` component, and shows framework logos.
- **`components/HelloWorld.vue`**: Example component with a counter and links to Vue resources. Demonstrates hot module replacement (HMR).
- **`assets/css/`**: Contains global and component-specific CSS.
- **`assets/svg/`**: SVG logos for Deno, Vite, and Vue.

---

## Development

All build and dev tasks are managed from the project root using Deno tasks. See the main [README.md](../README.md) for details.

---

## Learn More

- [Vue 3 Docs](https://vuejs.org/guide/introduction.html)
- [Vite Docs](https://vitejs.dev/guide/)
- [TypeScript in Vue](https://vuejs.org/guide/typescript/overview.html)
- [Tailwind CSS](https://tailwindcss.com/)
