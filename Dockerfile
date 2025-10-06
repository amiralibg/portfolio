# Stage 1: Build the application
FROM node:20 AS build-env
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine
WORKDIR /app

RUN npm install -g serve && \
    apk add --no-cache wget

ENV NODE_ENV=production

# Copy the built application
COPY --from=build-env /app/build ./build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Serve from the client directory (React Router structure)
CMD ["serve", "-s", "build/client", "-l", "3000"]