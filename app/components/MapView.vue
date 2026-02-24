<template>
  <MglMap
    ref="mapRef"
    :center="center"
    :map-style="style"
    :zoom="zoom"
    style="height: 100%; width: 100%;"
    @map:load="onMapLoad"
  >
    <mgl-marker
      v-for="node in nodes"
      v-show="mode === 'nodes'"
      :key="node.id"
      :coordinates="[node.longitude, node.latitude]"
    >
      <template #marker>
        <NodePopover :node="node">
          <div
            class="pin cursor-pointer"
            :class="{ 'pin--active': selectedNode?.id === node.id || hoveredNodeId === node.id }"
            @mouseenter="emit('hoverNode', node.id)"
            @mouseleave="emit('leaveNode')"
            @click.stop="emit('selectNode', node.id)"
          />
        </NodePopover>
      </template>
    </mgl-marker>

    <mgl-geo-json-source
      source-id="trails"
      :data="trailGeoJson"
    >
      <mgl-line-layer
        layer-id="trails-line"
        :layout="{ 'line-join': 'round', 'line-cap': 'round' }"
        :paint="{
          'line-color': '#16a34a',
          'line-width': 2 }"
        :visibility="mode === 'trails' ? 'visible' : 'none'"
      />
    </mgl-geo-json-source>

    <MglNavigationControl />
  </MglMap>
</template>

<script setup lang="ts">
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { NodeDto, TrailListItemDto } from '~/lib/api/types.gen'
import type { TrailDashboardState } from '~/composables/useTrailDashboard'
import { TRAIL_DASHBOARD_KEY } from '~/composables/useTrailDashboard'
import { ref, computed, inject } from 'vue'

const props = defineProps<{
  mode: 'nodes' | 'trails'
  nodes: NodeDto[]
  trails: TrailListItemDto[]
  selectedNode?: NodeDto | null
  hoveredNodeId?: string | null
  selectedTrailId?: string | null
}>()

const emit = defineEmits<{
  (e: 'selectNode' | 'hoverNode' | 'selectTrail', id: string): void
  (e: 'leaveNode'): void
}>()

const dashboard = inject<TrailDashboardState>(TRAIL_DASHBOARD_KEY)

const mapRef = ref<{ map: MapLibreMap } | null>(null)

const style = '/map/style.json'
const center: [number, number] = [13.0867, 47.7239]
const zoom = 12

const trailGeoJson = computed(() => ({
  type: 'FeatureCollection',
  features: props.trails
    .filter(t => t.geometry_geojson)
    .map(trail => ({
      type: 'Feature',
      properties: {
        id: trail.id,
        name: trail.name,
        source: trail.source
      },
      geometry: trail.geometry_geojson
    }))
}))

function getMap() {
  return mapRef.value?.map
}

function updateBbox() {
  const map = getMap()
  if (!map || !dashboard) return
  const b = map.getBounds()
  dashboard.setTrailBbox({
    min_lon: b.getWest(),
    min_lat: b.getSouth(),
    max_lon: b.getEast(),
    max_lat: b.getNorth()
  })
}

const onMapLoad = () => {
  const map = getMap()
  if (!map) return
  updateBbox()
  map.on('moveend', updateBbox)
}
</script>

<style scoped>
.pin {
  position: relative;
  width: 14px;
  height: 14px;
  background: #5c5c5c;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg) scale(1);
  transition:
    transform 160ms cubic-bezier(0.4, 0, 0.2, 1),
    background-color 140ms ease,
    box-shadow 140ms ease;
  will-change: transform;
}

.pin::after {
  content: "";
  position: absolute;
  top: 4px;
  left: 4px;
  width: 6px;
  height: 6px;
  background: white;
  border-radius: 50%;
}

.pin--active {
  background-color: #000000;
  transform: rotate(-45deg) scale(1.25);
}
</style>
