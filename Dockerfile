# syntax=docker/dockerfile:1
# Multi-stage build for the Strata frontend (Bun + Vite → static SPA on nginx).

# ---- build ----
FROM oven/bun:1 AS build
WORKDIR /app
# Warm the dependency cache (lockfile changes rarely).
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
# Then the sources, and build the production bundle (tsc -b && vite build).
COPY . .
RUN bun run build

# ---- runtime ----
# Unprivileged nginx: runs as uid 101 and listens on :8080 (no root, no
# privileged port) — matches the Deployment securityContext.
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
EXPOSE 8080
