<template>
  <div
    class="flex items-start gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
    @click="$emit('select', node.id)"
  >
    <span
      class="mt-1 h-2.5 w-2.5 rounded-full shrink-0"
      :class="statusClass"
    />

    <div class="min-w-0">
      <p class="font-medium text-sm truncate">
        {{ node.name }}
      </p>
      <p class="text-xs text-gray-500 truncate">
        Every {{ node.send_frequency_seconds }}s
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getNodeStatusClass } from '~/utils/node-status'
import type { NodeDto } from '~/lib/api/types.gen'

defineEmits<{
  (e: 'select', nodeId: string): void
}>()

const props = defineProps<{
  node: NodeDto
}>()

const statusClass = computed(() => {
  return getNodeStatusClass(props.node.status)
})
</script>
