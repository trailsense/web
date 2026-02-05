<template>
  <div class="p-4 space-y-4">
    <UButton
      icon="i-lucide-arrow-left"
      variant="ghost"
      size="xs"
      @click="$emit('back')"
    >
      Back to nodes
    </UButton>

    <div>
      <h2 class="text-lg font-semibold">
        {{ node.name }}
      </h2>
      <p class="text-sm text-gray-500">
        {{ node.region }}
      </p>
    </div>

    <div class="flex items-center gap-2 text-sm">
      <span
        class="h-2.5 w-2.5 rounded-full"
        :class="statusClass"
      />
      <span class="capitalize">
        {{ node.status }}
      </span>
    </div>

    <div>
      <p class="text-sm font-medium mb-1">
        Tracked trails
      </p>
      <ul class="list-disc list-inside text-sm text-gray-600">
        <li
          v-for="trail in node.trails"
          :key="trail"
        >
          {{ trail }}
        </li>
      </ul>
    </div>

    <div class="text-xs space-y-1 text-gray-500">
      <p><strong>Coordinates:</strong> {{ node.coordinates.join(', ') }}</p>
      <p><strong>Last sync:</strong> {{ formatDate(node.lastSynchronized) }}</p>
      <p><strong>Last maintenance:</strong> {{ node.lastMaintenance }}</p>
      <p><strong>Setup date:</strong> {{ node.setupDate }}</p>
    </div>
    <div v-if="node.activity">
      <NodeActivityChart :activity="node.activity" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TrailNode } from '~/data/mockNodes'

const props = defineProps<{
  node: TrailNode
}>()

defineEmits<{
  (e: 'back'): void
}>()

const statusClass = computed(() => {
  switch (props.node.status) {
    case 'active': return 'bg-green-500'
    case 'syncing': return 'bg-yellow-400'
    case 'inactive': return 'bg-red-500'
    default: return 'bg-gray-400'
  }
})

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString()
</script>
