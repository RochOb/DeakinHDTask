# ===== server build stage =====
FROM node:20-bookworm-slim AS srv
WORKDIR /srv
COPY server/package.json ./
RUN npm install
COPY server/ .
# Builds to /srv/dist per server/tsconfig.json
RUN npm run build

# ===== ui build stage =====
FROM node:20-bookworm-slim AS ui
WORKDIR /app
COPY app/package.json ./
RUN npm install
COPY app/ .
# Builds to /app/dist
RUN npm run build

# ===== final runtime =====
FROM node:20-bookworm-slim

# Install **production** server dependencies
WORKDIR /server
COPY --from=srv /srv/package.json ./package.json

COPY --from=srv /srv/package-lock.json ./package-lock.json

RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# Copy built server JS
COPY --from=srv /srv/dist ./dist

# Copy built UI
WORKDIR /
COPY --from=ui /app/dist /app_build

ENV NODE_ENV=production
EXPOSE 8080
# Start the correct server build (has /_internal/notify)
CMD ["node", "/server/dist/index.js"]
