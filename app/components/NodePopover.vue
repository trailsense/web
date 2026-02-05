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
          {{ node.region }}
        </p>

        <div>
          <p class="font-medium">
            Tracked trails
          </p>
          <ul class="list-disc list-inside text-xs">
            <li
              v-for="trail in node.trails"
              :key="trail"
            >
              {{ trail }}
            </li>
          </ul>
        </div>

        <div class="text-xs space-y-1">
          <p><strong>Coordinates:</strong> {{ node.coordinates.join(', ') }}</p>
          <p><strong>Last sync:</strong> {{ formatDate(node.lastSynchronized) }}</p>
          <p><strong>Last maintenance:</strong> {{ node.lastMaintenance }}</p>
          <p><strong>Setup date:</strong> {{ node.setupDate }}</p>
        </div>
      </div>
    </template>
  </UPopover>
</template>

<script setup lang="ts">
import type { TrailNode } from '~/data/mockNodes'

const props = defineProps<{
  node: TrailNode
}>()

const statusClass = computed(() => {
  switch (props.node.status) {
    case 'active':
      return 'bg-green-500'
    case 'syncing':
      return 'bg-yellow-400'
    case 'inactive':
      return 'bg-red-500'
    default:
      return 'bg-gray-400'
  }
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
