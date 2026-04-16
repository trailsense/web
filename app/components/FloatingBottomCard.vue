<template>
  <section
    class="absolute bottom-(--layout-gap) left-(--layout-gap) right-(--layout-gap) z-45 min-h-25 overflow-hidden rounded-3xl border border-default bg-(--sidebar-bg) shadow-sm backdrop-blur"
    :class="!sidebarCollapsed ? 'lg:left-[calc(var(--layout-gap)+var(--sidebar-width)+var(--layout-gap))]' : ''"
  >
    <div class="flex min-h-25 items-center px-4 py-3">
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
