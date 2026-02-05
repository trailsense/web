<template>
  <div class="py-2">
    <p class="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
      Trail Nodes
    </p>

    <div class="space-y-1">
      <NodeListItem
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        @select="$emit('select', node)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrailNode } from '~/data/mockNodes'

defineProps<{
  nodes: TrailNode[]
}>()

defineEmits<{
  (e: 'select', node: TrailNode): void
}>()
</script>
