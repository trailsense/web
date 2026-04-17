<template>
  <button
    type="button"
    class="group relative mx-4 flex w-[calc(100%-2rem)] flex-col cursor-pointer gap-2 overflow-hidden rounded-xl border border-default bg-elevated px-3 py-3 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accented hover:shadow-sm hover:shadow-black/5"
    @click="$emit('select', id)"
    @mouseenter="$emit('hover', id)"
    @mouseleave="$emit('leave')"
  >
    <div class="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-brand-400 to-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    <div class="flex items-start justify-between gap-2">
      <p class="font-body-normal min-w-0 truncate text-highlighted">
        {{ title }}
      </p>
      <UBadge
        color="secondary"
        variant="soft"
        class="shrink-0 rounded-full border-0 bg-green-100 text-green-900"
      >
        0 Activations
      </UBadge>
    </div>

    <p class="font-body-small truncate text-muted">
      {{ subtitle }}
    </p>
  </button>
</template>

<script setup lang="ts">
import { UBadge } from '#components'

defineProps<{
  id: string
  title: string
  subtitle: string
}>()

defineEmits<{
  (e: 'select' | 'hover', id: string): void
  (e: 'leave'): void
}>()
</script>
