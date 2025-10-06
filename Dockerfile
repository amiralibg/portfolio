# Multi-stage build for optimized production image

# Stage 1: Install all dependencies for building
FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Stage 2: Install only production dependencies
FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production && yarn cache clean

# Stage 3: Build the application
FROM node:20-alpine AS build-env
WORKDIR /app
COPY . .
COPY --from=development-dependencies-env /app/node_modules ./node_modules
RUN yarn build

# Stage 4: Production runtime
FROM node:20-alpine
WORKDIR /app

# Install wget for healthcheck
RUN apk add --no-cache wget

# Set environment to production
ENV NODE_ENV=production

# Copy package files
COPY package.json yarn.lock ./

# Copy production dependencies
COPY --from=production-dependencies-env /app/node_modules ./node_modules

# Copy built application
COPY --from=build-env /app/build ./build

# Copy public assets (required for 3D models and static files)
COPY --from=build-env /app/public ./public

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the application
CMD ["yarn", "start"]