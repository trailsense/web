<script setup>
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/favicon.png' }
  ],
  htmlAttrs: {
    lang: 'en'
  }
})

const title = 'TrailSense'
const description = 'TrailSense is an open-source tool for visualizing anonymous crowd and trail activity. It helps tourism boards, local authorities, and event organizers understand how hiking areas and outdoor spaces are used over time.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: '/trailsense.jpg',
  twitterImage: '/trailsense.jpg',
  twitterCard: 'summary_large_image'
})
</script>

<template>
  <UApp>
    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>
  </UApp>
</template>
