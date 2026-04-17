<template>
  <div class="py-2">
    <p class="px-4 pb-4 font-body-small text-muted">
      Available Nodes
    </p>

    <p
      v-if="isLoading"
      class="px-4 py-2 text-sm text-muted"
    >
      Loading nodes...
    </p>

    <p
      v-else-if="errorText"
      class="px-4 py-2 text-sm text-error"
    >
      {{ errorText }}
    </p>

    <p
      v-else-if="nodes.length === 0"
      class="px-4 py-2 text-sm text-muted"
    >
      No nodes available.
    </p>

    <div
      v-else
      class="space-y-3"
    >
      <SidebarListCard
        v-for="node in nodes"
        :id="node.id"
        :key="node.id"
        :subtitle="`Every ${node.send_frequency_seconds}s`"
        :title="node.name"
        @select="$emit('select', node.id)"
        @hover="$emit('hover', node.id)"
        @leave="$emit('leave')"
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
  (e: 'select' | 'hover', nodeId: string): void
  (e: 'leave'): void
}>()
</script>
