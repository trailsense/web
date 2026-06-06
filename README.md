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

## Runtime Configuration

- `NUXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is the only Clerk key needed for this client-side build.
- `NUXT_PUBLIC_API_BASE_URL` can override the backend base URL used by the generated API client.
- `NUXT_PUBLIC_CLERK_JWT_TEMPLATE` can be set to request a Clerk JWT template for backend auth (use this when your API requires claims like `aud`).
- `EXPOSE 3000` in the Dockerfile is documentation; runtime port comes from `NITRO_PORT`.

## Production Deployment

CI publishes the container image to:

- `ghcr.io/trailsense/web`

Kubernetes deployment state lives in `trailsense-infra`. Runtime configuration,
replica counts, routes, and image tags should be changed there.
