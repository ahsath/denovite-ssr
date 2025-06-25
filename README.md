# Deno + ExpressJS + Vite + Vue SSR Template

A modern starter template for building full-stack web applications with:

- **Deno**: Secure runtime for JavaScript and TypeScript
- **ExpressJS-style server**: Familiar routing and middleware (using Deno-compatible frameworks)
- **Vite**: Lightning-fast frontend tooling
- **Vue 3**: Progressive JavaScript framework
- **Server-Side Rendering (SSR)**: SEO-friendly, fast initial loads

---

## Features

- ⚡️ **Vite** for instant hot module reload and fast builds
- 🦕 **Deno** for backend with TypeScript out of the box
- 🗂️ Express-like routing for easy API/server logic
- 🖼️ **Vue 3** with SSR for optimal performance and SEO
- 🐳 Docker & Compose support for easy deployment and live development
- 📦 Ready for local development and production

---

## Getting Started

### Prerequisites

- [Deno](https://deno.land/) (v1.30+ recommended)
- [Docker](https://www.docker.com/) (optional, for containerized setup)

---

### 1. Clone the Template

```bash
git clone https://github.com/your-username/denovite-ssr-template.git
cd denovite-ssr-template
```

---

### 2. Development

#### Start the Server in Development Mode

```bash
deno task server:dev
```

#### Build the Client

```bash
deno task build:client
```

#### Build the Server (includes client build)

```bash
deno task build:server
```

#### Start the Server in Production Mode

```bash
deno task server:prod
```

---

### 3. Docker (Optional)

#### Start with Docker Compose (with live reload)

```bash
docker compose up --watch
```

- The `--watch` flag enables live syncing and hot-reloading for both `client` and `server` directories.
- Ports `8080` (app) and `24678` (Vite HMR) are exposed.

---

## Project Structure

```
.
├── client/         # Vite + Vue 3 app (frontend)
│   └── src/
├── server/         # Deno server (SSR + API)
│   └── views/      # Liquid templates for SSR
├── public/         # Static assets
├── deno.json       # Deno config & tasks
├── Dockerfile      # Docker support
├── compose.yaml    # Docker Compose config
```

---

## Customization

- Replace the contents of `client/src` and `server/views` with your own app logic and templates.
- Update `server/server.ts` for custom API routes or SSR logic.

---

## License

MIT

---

## Credits

- [Deno](https://deno.land/)
- [Vite](https://vitejs.dev/)
- [Vue.js](https://vuejs.org/)
- [LiquidJS](https://liquidjs.com/) (for SSR templates)
