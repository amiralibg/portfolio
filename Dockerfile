# --- Build stage ---
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies (pnpm via corepack).
#
# The exact pnpm version comes from the "packageManager" field in package.json,
# which is why package.json is copied BEFORE the install runs. Without that pin,
# corepack pulls whatever pnpm is newest that day: this build once resolved
# pnpm 11, whose minimumReleaseAge supply-chain policy rejected a lockfile that
# pnpm 10 had generated locally, and the image failed to build for a reason that
# would have disappeared by itself a couple of hours later.
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Where the contact form posts. Vite inlines VITE_* at BUILD time, so this has
# to be a build arg — a Dokploy runtime environment variable would never reach
# the bundle. Leave it empty to use the same-origin /api path (which needs the
# proxy block in nginx.conf); set it to a full URL when the API lives on its own
# domain, e.g. https://api.amiralibg.xyz/api/contact
ARG VITE_CONTACT_API=""
ENV VITE_CONTACT_API=$VITE_CONTACT_API

# Build the static site
COPY . .
RUN pnpm run build

# --- Serve stage ---
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
