<template>
  <section
    data-map-overlay="bottom-card"
    class="absolute bottom-[var(--layout-gap)] left-[var(--layout-gap)] right-[var(--layout-gap)] z-45 min-h-32 overflow-hidden rounded-3xl border border-default bg-default shadow-sm backdrop-blur"
    :class="!sidebarCollapsed ? 'lg:left-[calc(var(--layout-gap)+var(--sidebar-width)+var(--layout-gap))]' : ''"
  >
    <div class="flex min-h-32 items-stretch px-4 py-3">
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
