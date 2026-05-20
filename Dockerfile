# Stage 1: Builder — builds all packages and both apps in dependency order
FROM node:20-alpine AS builder
WORKDIR /app

# Copy workspace manifests for better layer caching
COPY package.json package-lock.json turbo.json ./
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/

RUN npm ci

# Copy all source (after npm ci to preserve the layer cache above)
COPY packages ./packages
COPY apps ./apps

# turbo respects ^build, so order is: types → utils → (client, server) in parallel
RUN npx turbo build

# Stage 2: Production runtime — lean image with only what's needed to run
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# Workspace manifests for npm ci
COPY package.json package-lock.json ./
COPY apps/client/package.json ./apps/client/
COPY apps/server/package.json ./apps/server/
COPY packages/types/package.json ./packages/types/
COPY packages/utils/package.json ./packages/utils/
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/

RUN npm ci --omit=dev

# Bring prisma CLI in from builder (it's a devDep, not installed by --omit=dev)
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Built workspace packages needed at server runtime
COPY --from=builder /app/packages/types/dist ./packages/types/dist
COPY --from=builder /app/packages/utils/dist ./packages/utils/dist

# Prisma schema — generate client against production node_modules
COPY apps/server/prisma ./apps/server/prisma
RUN ./node_modules/.bin/prisma generate --schema=./apps/server/prisma/schema.prisma

# Compiled server and React static assets
COPY --from=builder /app/apps/server/dist ./apps/server/dist
COPY --from=builder /app/apps/client/dist ./apps/client/dist

COPY scripts/docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

RUN addgroup -S appgroup && adduser -S appuser -G appgroup && \
    chown -R appuser:appgroup /app
USER appuser

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
