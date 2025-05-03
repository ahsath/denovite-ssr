# syntax=docker/dockerfile:1

FROM denoland/deno:latest AS base
WORKDIR /app
COPY deno.json deno.lock .
COPY client ./client
COPY server ./server
ENV DENO_DIR=./.deno_cache
RUN --mount=type=cache,target=/app/.deno_cache \
    deno install

# Build the development image
FROM base AS dev
CMD ["deno", "task", "server:dev"]

# Build the production image
FROM base AS prod
RUN deno task build:server
CMD ["deno", "task", "server:prod"]