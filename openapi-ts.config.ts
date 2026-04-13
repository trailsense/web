import { defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'https://api.trailsense.daugt.com/docs/openapi.json',
  output: 'app/lib/api',
  plugins: [
    '@hey-api/typescript',
    '@hey-api/sdk',
    {
      name: '@hey-api/client-ofetch',
      baseUrl: false,
      runtimeConfigPath: '~/lib/api-client-config'
    },
    '@pinia/colada',
    '@hey-api/schemas'
  ]
})
