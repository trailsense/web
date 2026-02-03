<script lang="ts" setup>
definePageMeta({
  layout: 'auth'
})
</script>

<template>
  <div class="min-h-dvh flex items-center-safe justify-center-safe">
    <SignUp
      routing="hash"
      sign-in-url="/login"
    />
  </div>
</template>
