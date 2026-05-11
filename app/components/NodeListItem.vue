<template>
  <div
    class="mx-4 flex cursor-pointer items-start gap-3 rounded-xl border border-default bg-elevated px-3 py-3 hover:border-accented"
    @click="$emit('select', node.id)"
  >
    <div class="min-w-0">
      <p class="font-body-normal truncate pb-2 text-highlighted">
        {{ node.name }}
      </p>
      <p class="font-body-small truncate text-muted">
        {{ getNodeStatusLabel(node.status) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { NodeDto } from '~/lib/api/types.gen'
import { getNodeStatusLabel } from '~/utils/node-status'

defineEmits<{
  (e: 'select', nodeId: string): void
}>()

defineProps<{
  node: NodeDto
}>()
</script>
