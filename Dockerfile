# Use regular node for building (better npm ci support)
FROM node:20 AS development-dependencies-env
WORKDIR /app
COPY package*.json ./
# Use npm install instead of npm ci to properly install optional deps
RUN npm install

FROM node:20 AS production-dependencies-env
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production && npm cache clean --force

FROM node:20 AS build-env
WORKDIR /app
COPY . .
COPY --from=development-dependencies-env /app/node_modules ./node_modules
RUN npm run build

# Use alpine only for final production image
FROM node:20-alpine
WORKDIR /app

RUN npm install -g serve && \
    apk add --no-cache wget

ENV NODE_ENV=production

COPY --from=build-env /app/build ./build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

CMD ["serve", "-s", "build", "-l", "3000"]