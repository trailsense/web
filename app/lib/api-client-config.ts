export const createClientConfig = (override = {}) => ({
  baseUrl: import.meta.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  ...override
})
