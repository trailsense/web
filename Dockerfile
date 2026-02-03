# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS builder

WORKDIR /app

ARG NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG NUXT_CLERK_SECRET_KEY

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY="$NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY" \
    NUXT_CLERK_SECRET_KEY="$NUXT_CLERK_SECRET_KEY" \
    npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

RUN useradd --system --create-home --uid 10001 appuser

COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production

EXPOSE 3000

USER appuser

ENTRYPOINT ["node", ".output/server/index.mjs"]
