# ── Multi-stage Dockerfile for DAOS NestJS microservices ──────────────────────
# Build arg APP must match a project name in nest-cli.json (e.g. tenant-identity).
# Usage:
#   docker build --build-arg APP=tenant-identity -t daos/tenant-identity:dev .
# ──────────────────────────────────────────────────────────────────────────────

ARG NODE_IMAGE=node:22-alpine

# ═══════════════════════════════════════════════════════════════════════════════
# Stage 1 – build
# ═══════════════════════════════════════════════════════════════════════════════
FROM ${NODE_IMAGE} AS build

ARG APP

WORKDIR /app

# Install dependencies first (layer cache)
COPY package.json package-lock.json ./
RUN npm ci

# Copy monorepo source
COPY tsconfig.json nest-cli.json ./
COPY apps/ apps/
COPY libs/ libs/

# Build the target application (webpack via @nestjs/cli)
RUN npx nest build ${APP}

# ═══════════════════════════════════════════════════════════════════════════════
# Stage 2 – runtime
# ═══════════════════════════════════════════════════════════════════════════════
FROM ${NODE_IMAGE} AS runtime

ARG APP
ENV APP=${APP}

WORKDIR /app

# Production dependencies only
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy built output
COPY --from=build /app/dist/apps/${APP} ./dist

EXPOSE 3000

CMD ["sh", "-c", "node dist/main.js"]
