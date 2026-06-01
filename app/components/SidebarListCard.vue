<template>
  <button
    type="button"
    class="group relative mx-3 flex w-[calc(100%-1.5rem)] flex-col cursor-pointer gap-1.5 overflow-hidden rounded-xl border border-default bg-elevated px-3 py-2.5 text-left transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-accented hover:shadow-sm hover:shadow-black/5 lg:mx-4 lg:w-[calc(100%-2rem)] lg:gap-2 lg:py-3"
    @click="$emit('select', id)"
    @mouseenter="$emit('hover', id)"
    @mouseleave="$emit('leave')"
  >
    <div class="absolute inset-y-0 left-0 w-1 bg-linear-to-b from-brand-400 to-brand-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

    <div class="flex items-start justify-between gap-2">
      <p class="min-w-0 truncate text-sm text-highlighted lg:font-body-normal lg:text-base">
        {{ title }}
      </p>
      <UBadge
        color="secondary"
        variant="soft"
        class="shrink-0 rounded-full border-0 bg-green-100 text-green-900"
      >
        {{ activationLabel }}
      </UBadge>
    </div>

    <p class="truncate text-xs text-muted lg:font-body-small lg:text-sm">
      {{ subtitle }}
    </p>
  </button>
</template>

<script setup lang="ts">
import { UBadge } from '#components'

const props = withDefaults(defineProps<{
  activationCount?: number | null
  id: string
  title: string
  subtitle: string
}>(), {
  activationCount: null
})

const activationLabel = computed(() => {
  if (props.activationCount === null || props.activationCount === undefined) {
    return 'No Activations'
  }

  const formatted = new Intl.NumberFormat().format(props.activationCount)
  return `${formatted} Activation${props.activationCount === 1 ? '' : 's'}`
})

defineEmits<{
  (e: 'select' | 'hover', id: string): void
  (e: 'leave'): void
}>()
</script>
