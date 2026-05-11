<script lang="ts" setup>
definePageMeta({
  layout: 'auth'
})

const route = useRoute()

const fallbackRedirectUrl = computed(() => {
  const redirectUrl = route.query.redirect_url

  if (typeof redirectUrl !== 'string' || !redirectUrl.startsWith('/') || redirectUrl.startsWith('//')) {
    return '/'
  }

  return redirectUrl
})

const signInUrl = computed(() =>
  fallbackRedirectUrl.value === '/'
    ? '/login'
    : `/login?redirect_url=${encodeURIComponent(fallbackRedirectUrl.value)}`
)
</script>

<template>
  <div class="min-h-dvh flex items-center-safe justify-center-safe">
    <SignUp
      :fallback-redirect-url="fallbackRedirectUrl"
      :sign-in-fallback-redirect-url="fallbackRedirectUrl"
      :sign-in-url="signInUrl"
      routing="hash"
    />
  </div>
</template>
