<template>
  <NuxtLayout name="default">
    <template #sidebar>
      <NodeSidebarList
        v-if="!selectedNode"
        :error-text="nodesErrorText"
        :is-loading="isNodesLoading"
        :nodes="nodes"
        @select="selectNode"
        @hover="hoveredNodeId = $event"
        @leave="hoveredNodeId = null"
      />

      <NodeSidebarDetails
        v-else
        :node="selectedNode"
        @back="selectNode(null)"
      />
    </template>

    <MapView
      :nodes="nodes"
      :selected-node="selectedNode"
      :hovered-node-id="hoveredNodeId"
      @select="selectNode"
      @hover="hoveredNodeId = $event"
      @leave="hoveredNodeId = null"
    />
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { TRAIL_DASHBOARD_KEY, useTrailDashboard } from '~/composables/useTrailDashboard'

definePageMeta({
  layout: false
})

const dashboard = useTrailDashboard()
const { nodes, nodesQuery, selectedNode, selectNode } = dashboard
const isNodesLoading = computed(() => nodesQuery.isLoading.value || nodesQuery.isPending.value)
const nodesErrorText = computed(() => (nodesQuery.error.value ? 'Failed to load nodes.' : ''))
const hoveredNodeId = ref<string | null>(null)

provide(TRAIL_DASHBOARD_KEY, dashboard)
</script>
