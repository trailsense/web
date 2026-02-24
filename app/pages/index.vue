<template>
  <NuxtLayout name="default">
    <template #sidebar="{ viewMode }">
      <template v-if="viewMode === 'nodes'">
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

      <template v-else>
        <TrailSidebarList
          v-if="!selectedTrail"
          :trails="trails"
          @select="selectTrail"
        />

        <TrailSidebarDetails
          v-else
          :trail="selectedTrail"
          @back="selectTrail(null)"
        />
      </template>
    </template>

    <MapView
      :mode="viewMode"
      :nodes="nodes"
      :trails="trails"
      :selected-node="selectedNode"
      :hovered-node-id="hoveredNodeId"
      :selected-trail-id="selectedTrailId"
      @select-node="selectNode"
      @hover-node="hoveredNodeId = $event"
      @leave-node="hoveredNodeId = null"
      @select-trail="selectTrail"
    />
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { TRAIL_DASHBOARD_KEY, useTrailDashboard } from '~/composables/useTrailDashboard'

definePageMeta({
  layout: false
})

const dashboard = useTrailDashboard()

const {
  nodes,
  nodesQuery,
  selectedNode,
  selectNode,
  trails
} = dashboard

const isNodesLoading = computed(() => nodesQuery.isLoading.value || nodesQuery.isPending.value)
const nodesErrorText = computed(() => (nodesQuery.error.value ? 'Failed to load nodes.' : ''))

const hoveredNodeId = ref<string | null>(null)

provide(TRAIL_DASHBOARD_KEY, dashboard)

const selectedTrailId = ref<string | null>(null)

const selectedTrail = computed(() =>
  trails.value.find(t => t.id === selectedTrailId.value) ?? null
)

const selectTrail = (id: string | null) => {
  selectedTrailId.value = id
}
</script>
