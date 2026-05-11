# TrailSense Web

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)

## Setup

Make sure to install the dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm dev
```

## Production

Build the application for production:

```bash
npm build
```

Locally preview production build:

```bash
npm preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Production compose locally (plain Docker Compose)

`compose.yaml` can stay focused on local defaults.
To run the production stack locally with a host port mapping, use the explicit local override file:

```sh
docker compose \
  -f compose.production.yaml \
  -f compose.production.local.yaml \
  --env-file .env.production \
  up -d
```

This publishes the web app at `http://localhost:3000`.

Stop the local production stack:

```sh
docker compose \
  -f compose.production.yaml \
  -f compose.production.local.yaml \
  --env-file .env.production \
  down
```

## Uncloud

1. Copy `.env.production.example` to `.env.production` and fill values.
2. Deploy with:

```bash
mise run deploy
```

Notes:
- `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is the only Clerk key needed for this client-side build.
- `NUXT_PUBLIC_API_BASE_URL` can override the backend base URL used by the generated API client.
- `NUXT_PUBLIC_CLERK_JWT_TEMPLATE` can be set to request a Clerk JWT template for backend auth (use this when your API requires claims like `aud`).
- `EXPOSE 3000` in the Dockerfile is documentation; runtime port comes from `NITRO_PORT`.
