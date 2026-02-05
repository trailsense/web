<template>
  <div class="py-2">
    <p class="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
      Trail Nodes
    </p>

    <p
      v-if="isLoading"
      class="px-3 py-2 text-sm text-gray-500"
    >
      Loading nodes...
    </p>

    <p
      v-else-if="errorText"
      class="px-3 py-2 text-sm text-red-600"
    >
      {{ errorText }}
    </p>

    <p
      v-else-if="nodes.length === 0"
      class="px-3 py-2 text-sm text-gray-500"
    >
      No nodes available.
    </p>

    <div
      v-else
      class="space-y-1"
    >
      <NodeListItem
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        @select="$emit('select', node.id)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NodeDto } from '~/lib/api/types.gen'

withDefaults(defineProps<{
  nodes: NodeDto[]
  isLoading?: boolean
  errorText?: string
}>(), {
  isLoading: false,
  errorText: ''
})

defineEmits<{
  (e: 'select', nodeId: string): void
}>()
</script>
