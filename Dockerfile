# syntax=docker/dockerfile:1

FROM denoland/deno:latest AS base
WORKDIR /app
COPY deno.json deno.lock .
ENV DENO_DIR=./.deno_cache
RUN --mount=type=cache,target=/app/.deno_cache \
    deno install

# Build the development image
# FROM base AS dev
# COPY server client ./
# CMD ["deno", "task", "server:dev"]

# Build the production image
FROM base AS prod
COPY client ./client
COPY server ./server
RUN deno task build:server
CMD ["deno", "task", "server:prod"]