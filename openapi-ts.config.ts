import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'https://api.trailsense.daugt.com/docs/openapi.json',
  output: 'app/lib/api',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk',
    '@hey-api/client-ofetch',
    '@pinia/colada',
    '@hey-api/schemas'
  ]
})
