<template>
  <div class="py-1 lg:py-2">
    <p class="px-3 pb-2 text-xs text-muted lg:px-4 lg:pb-4 lg:font-body-small">
      Available Nodes
    </p>

    <div
      v-if="isLoading"
      class="px-4 py-2"
    >
      <div class="flex items-center gap-2 text-sm text-muted">
        <UIcon
          name="i-lucide-loader-2"
          class="size-4 animate-spin"
        />
        <span>Loading nodes...</span>
      </div>
    </div>

    <div
      v-else-if="errorText"
      class="px-4 py-2"
    >
      <UAlert
        color="error"
        variant="soft"
        title="Failed to load nodes"
        :description="errorText"
      />
    </div>

    <div
      v-else-if="nodes.length === 0"
      class="px-4 py-2"
    >
      <UEmpty
        icon="i-lucide-radio"
        variant="naked"
        title="No nodes"
        description="No nodes available in this area."
      />
    </div>

    <div
      v-else
      class="space-y-2 lg:space-y-3"
    >
      <SidebarListCard
        v-for="node in nodes"
        :id="node.id"
        :key="node.id"
        :activation-count="node.activation_count"
        :subtitle="`Status: ${getNodeStatusLabel(node.status)}`"
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
import { getNodeStatusLabel } from '~/utils/node-status'

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
