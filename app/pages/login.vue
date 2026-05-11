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

const signUpUrl = computed(() =>
  fallbackRedirectUrl.value === '/'
    ? '/signup'
    : `/signup?redirect_url=${encodeURIComponent(fallbackRedirectUrl.value)}`
)
</script>

<template>
  <div class="min-h-dvh flex items-center-safe justify-center-safe">
    <SignIn
      :fallback-redirect-url="fallbackRedirectUrl"
      :sign-up-fallback-redirect-url="fallbackRedirectUrl"
      :sign-up-url="signUpUrl"
      routing="hash"
    />
  </div>
</template>
