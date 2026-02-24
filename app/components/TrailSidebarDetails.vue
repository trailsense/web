<template>
  <div class="p-4 space-y-4">
    <UButton
      icon="i-lucide-arrow-left"
      size="xs"
      variant="ghost"
      @click="$emit('back')"
    >
      Back to trails
    </UButton>

    <div>
      <h2 class="text-lg font-semibold">
        {{ trail.name }}
      </h2>
      <p class="text-sm text-gray-500">
        Source: {{ trail.source }}
      </p>

      <p
        v-if="trail.source_id"
        class="text-xs text-gray-400"
      >
        Source ID: {{ trail.source_id }}
      </p>
    </div>

    <div class="text-xs text-gray-400">
      ID: {{ trail.id }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrailListItemDto } from '~/lib/api/types.gen'

defineProps<{
  trail: TrailListItemDto
}>()

defineEmits<{
  (e: 'back'): void
}>()
</script>
