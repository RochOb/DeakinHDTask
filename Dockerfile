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
WORKDIR /
# Bring in the *server* build that contains your notify route
COPY --from=srv /srv/dist /server/dist
# Bring in the built UI assets
COPY --from=ui  /app/dist /app_build
ENV NODE_ENV=production
EXPOSE 8080
# Start the correct server entry (has /_internal/notify)
CMD ["node", "/server/dist/index.js"]
