# Multi-stage build for optimized production image

# Stage 1: Install all dependencies for building
FROM node:20-alpine AS development-dependencies-env
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Stage 2: Install only production dependencies
FROM node:20-alpine AS production-dependencies-env
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production --legacy-peer-deps && npm cache clean --force

# Stage 3: Build the application
FROM node:20-alpine AS build-env
WORKDIR /app
COPY . .
COPY --from=development-dependencies-env /app/node_modules ./node_modules
RUN npm run build

# Stage 4: Production runtime with serve
FROM node:20-alpine
WORKDIR /app

# Install serve and wget
RUN npm install -g serve && \
    apk add --no-cache wget

# Set environment to production
ENV NODE_ENV=production

# Copy built application
COPY --from=build-env /app/build ./build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application with serve
CMD ["serve", "-s", "build", "-l", "3000"]