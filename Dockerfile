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

# Install wget for healthcheck
RUN apk add --no-cache wget

ENV NODE_ENV=production

# Copy package files and install production deps (need for react-router-serve)
COPY package*.json ./
RUN npm install --only=production

# Copy the entire build directory (includes both client and server)
COPY --from=build-env /app/build ./build

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Use React Router's server (not serve)
CMD ["npm", "start"]