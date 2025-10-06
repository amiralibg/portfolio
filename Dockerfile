# Stage 1: Build the application
FROM node:20 AS build-env
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies fresh in build stage
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Stage 2: Production runtime
FROM node:20-alpine
WORKDIR /app

# Install serve and wget
RUN npm install -g serve && \
    apk add --no-cache wget

# Set environment to production
ENV NODE_ENV=production

# Copy only the built application
COPY --from=build-env /app/build ./build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Start the application with serve
CMD ["serve", "-s", "build", "-l", "3000"]