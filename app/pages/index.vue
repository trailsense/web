<template>
  <NuxtLayout name="default">
    <template #sidebar>
      <template v-if="viewMode === 'nodes'">
        <NodeSidebarList
          v-if="!selectedNode"
          :error-text="nodesErrorText"
          :is-loading="isNodesLoading"
          :nodes="nodes"
          @select="selectNodeHandler"
          @hover="hoveredNodeId = $event"
          @leave="hoveredNodeId = null"
        />

        <NodeSidebarDetails
          v-else
          :node="selectedNode"
          @back="backFromNode"
        />
      </template>

      <template v-else>
        <TrailSidebarList
          v-if="!selectedTrail"
          :trails="trails"
          @select="selectTrailHandler"
          @hover="hoveredTrailId = $event"
          @leave="hoveredTrailId = null"
        />

        <TrailSidebarDetails
          v-else
          :trail="selectedTrail"
          @back="backFromTrail"
        />
      </template>
    </template>

    <template #bottom-card>
      <BottomCardLineChart />
    </template>
    <template #bottom-card-controls>
      <BottomTimelineGranularitySelect />
    </template>

    <MapView
      :mode="viewMode"
      :nodes="nodes"
      :trails="trails"
      :selected-node="selectedNode"
      :hovered-node-id="hoveredNodeId"
      :selected-trail-id="selectedTrailId"
      :hovered-trail-id-from-list="hoveredTrailId"
      @select-node="selectNodeHandler"
      @hover-node="hoveredNodeId = $event"
      @leave-node="hoveredNodeId = null"
      @select-trail="selectTrailHandler"
    />
  </NuxtLayout>
</template>

<script lang="ts" setup>
import { watch } from 'vue'
import { TRAIL_DASHBOARD_KEY, useTrailDashboard } from '~/composables/useTrailDashboard'

definePageMeta({
  layout: false
})

const dashboard = useTrailDashboard()

const hoveredTrailId = ref<string | null>(null)

const {
  nodes,
  nodesQuery,
  selectedNode,
  selectedTrail,
  selectedTrailId,
  selectNode,
  selectTrail,
  trails
} = dashboard

const isNodesLoading = computed(() => nodesQuery.isLoading.value || nodesQuery.isPending.value)
const nodesErrorText = computed(() => (nodesQuery.error.value ? 'Failed to load nodes.' : ''))

const hoveredNodeId = ref<string | null>(null)

provide(TRAIL_DASHBOARD_KEY, dashboard)

const viewMode = useState<'nodes' | 'trails'>('dashboard:viewMode')

watch(viewMode, (newMode) => {
  if (newMode === 'nodes' && selectedTrailId.value) {
    selectTrail(null)
  } else if (newMode === 'trails' && selectedNode.value) {
    selectNode(null)
  }
})

const selectNodeHandler = (id: string | null) => {
  selectNode(id)
  viewMode.value = 'nodes'
}

const selectTrailHandler = (id: string | null) => {
  hoveredTrailId.value = null
  selectTrail(id)
  viewMode.value = 'trails'
}

const backFromNode = () => {
  selectNode(null)
}

const backFromTrail = () => {
  selectTrail(null)
}
</script>
