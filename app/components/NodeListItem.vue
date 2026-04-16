<template>
  <div
    class="mx-4 flex cursor-pointer items-start gap-3 rounded-xl border border-(--color-lightgrey) bg-white px-3 py-3  hover:border-(--color-mediumgrey)"
    @click="$emit('select', node.id)"
  >
    <div class="min-w-0">
      <p class="font-body-normal truncate text-(--color-dark) pb-2">
        {{ node.name }}
      </p>
      <p class="font-body-small truncate text-(--color-muted)">
        Every {{ node.send_frequency_seconds }}s
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NodeDto } from '~/lib/api/types.gen'

defineEmits<{
  (e: 'select', nodeId: string): void
}>()

defineProps<{
  node: NodeDto
}>()
</script>
