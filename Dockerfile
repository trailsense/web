# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm install --no-audit

COPY . .
RUN npm run build

FROM node:22-bookworm-slim AS runtime

WORKDIR /app

RUN useradd --system --create-home --uid 10001 appuser

COPY --from=builder /app/.output ./.output

ENV NODE_ENV=production

# EXPOSE is documentation only. Runtime listener is configured by NITRO_PORT.
EXPOSE 3000

USER appuser

ENTRYPOINT ["node", ".output/server/index.mjs"]
