# --- build frontend ---
FROM node:20-bookworm-slim AS ui
WORKDIR /app
COPY app/package.json ./
RUN npm install
COPY app/ .
RUN npm run build

# --- build backend ---
FROM node:20-bookworm-slim AS srv
WORKDIR /srv
COPY server/package.json ./
RUN npm install
COPY server/ .
RUN npm run build

# --- runtime ---
FROM node:20-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
# backend runtime deps
COPY --from=srv /srv/package.json ./server/package.json
RUN npm --prefix ./server install --omit=dev
COPY --from=srv /srv/dist ./server/dist
# built frontend
COPY --from=ui /app/dist ./app_build
EXPOSE 8080
CMD ["node","server/dist/index.js"]
