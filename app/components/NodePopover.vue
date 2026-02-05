<template>
  <UPopover
    mode="hover"
  >
    <slot />

    <template #content>
      <div class="p-4 w-64 space-y-2 text-sm">
        <div class="flex items-center justify-between">
          <h3 class="font-semibold">
            {{ node.name }}
          </h3>
          <span
            class="status-dot"
            :class="statusClass"
            :title="node.status"
          />
        </div>

        <p class="text-xs text-gray-500">
          Node ID: {{ node.id }}
        </p>

        <div>
          <p><strong>Send frequency:</strong> Every {{ node.send_frequency_seconds }}s</p>
        </div>

        <div class="text-xs space-y-1">
          <p><strong>Coordinates:</strong> {{ node.longitude }}, {{ node.latitude }}</p>
          <p><strong>Created:</strong> {{ formatDate(node.created_at) }}</p>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import { getNodeStatusClass } from '~/utils/node-status'
import type { NodeDto } from '~/lib/api/types.gen'

const props = defineProps<{
  node: NodeDto
}>()

const statusClass = computed(() => {
  return getNodeStatusClass(props.node.status)
})

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString()
</script>

<style scoped>
.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
}
</style>
