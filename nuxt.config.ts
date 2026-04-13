// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({

  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-maplibre',
    '@pinia/nuxt',
    '@pinia/colada-nuxt',
    '@clerk/nuxt',
    'nuxt-charts'
  ],

  ssr: false,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  ui: {
    colorMode: false
  },

  runtimeConfig: {
    public: {
      apiBaseUrl: 'https://api.trailsense.daugt.com',
      clerkJwtTemplate: undefined
    }
  },

  compatibilityDate: '2025-01-15',

  clerk: {
    skipServerMiddleware: true
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
