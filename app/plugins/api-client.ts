import { client } from '~/lib/api/client.gen'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()
  const { getToken } = useAuth()
  const tokenTemplate = runtimeConfig.public.clerkJwtTemplate

  client.setConfig({
    baseUrl: runtimeConfig.public.apiBaseUrl,
    auth: async () => {
      const token = await getToken.value(
        tokenTemplate
          ? { template: tokenTemplate }
          : undefined
      )
      return token ?? undefined
    }
  })
})
