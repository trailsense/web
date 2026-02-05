<template>
  <div
    class="flex items-start gap-3 px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
    @click="$emit('select', node)"
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
        {{ node.region }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrailNode } from '~/data/mockNodes'

defineEmits<{
  (e: 'select', node: TrailNode): void
}>()

const props = defineProps<{
  node: TrailNode
}>()

const statusClass = computed(() => {
  switch (props.node.status) {
    case 'active': return 'bg-green-500'
    case 'syncing': return 'bg-yellow-400'
    case 'inactive': return 'bg-red-500'
    default: return 'bg-gray-400'
  }
})
</script>
