import { client } from '~/lib/api/client.gen'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()

  if (runtimeConfig.public.apiBaseUrl) {
    client.setConfig({
      baseUrl: runtimeConfig.public.apiBaseUrl
    })
  }
})
