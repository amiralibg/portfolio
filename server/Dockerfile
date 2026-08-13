# ---- build ----
FROM node:22-alpine AS build
WORKDIR /app

# better-sqlite3 is a native module and Alpine is musl, so the prebuilt
# binaries don't apply — it gets compiled here. These tools stay out of the
# runtime image.
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Drop dev dependencies but keep the compiled better-sqlite3 binding, so the
# runtime stage never needs a compiler.
RUN npm prune --omit=dev

# ---- runtime ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# The SQLite file lives here. Mount a Dokploy volume at /app/data or every
# redeploy starts with an empty inbox.
RUN mkdir -p /app/data && chown -R node:node /app/data
VOLUME ["/app/data"]

USER node

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:8000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "dist/app.js"]
