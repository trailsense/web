<template>
  <section
    data-map-overlay="bottom-card"
    class="w-full min-h-20 overflow-hidden rounded-3xl border border-default bg-default shadow-sm backdrop-blur"
  >
    <div class="flex min-h-20 items-stretch px-3 py-2">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    sidebarCollapsed?: boolean
  }>(),
  {
    sidebarCollapsed: false
  }
)
</script>
