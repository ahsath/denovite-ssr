# syntax=docker/dockerfile:1

FROM denoland/deno:latest AS base
WORKDIR /app
COPY deno.json deno.lock .
ENV DENO_DIR=./.deno_cache
RUN --mount=type=cache,target=/app/.deno_cache \
    deno install

# Build the development image
FROM base AS dev
COPY server client .
CMD ["deno", "task", "server:dev"]

# Build the client and server
FROM base AS builder
COPY client client
RUN deno task build:server && ls -la

# Build the production image
FROM builder AS prod
COPY server server
COPY --from=builder /app/dist .
CMD ["deno", "task", "server:prod"]