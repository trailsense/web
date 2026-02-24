<template>
  <MglMap
    ref="mapRef"
    :center="center"
    :map-style="style"
    :zoom="zoom"
    @load="onMapLoad"
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
            :class="{
              'pin--active':
                selectedNode?.id === node.id
                || hoveredNodeId === node.id
            }"
            @mouseenter="emit('hoverNode', node.id)"
            @mouseleave="emit('leaveNode')"
            @click.stop="emit('selectNode', node.id)"
          />
        </NodePopover>
      </template>
    </mgl-marker>

    <MglNavigationControl />
  </MglMap>
</template>

<script setup lang="ts">
import type { Map as MapLibreMap, GeoJSONSource } from 'maplibre-gl'
import type { NodeDto, TrailListItemDto } from '~/lib/api/types.gen'
import type { TrailDashboardState } from '~/composables/useTrailDashboard'
import { TRAIL_DASHBOARD_KEY } from '~/composables/useTrailDashboard'

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

interface MglMapInstance {
  map?: MapLibreMap
}

const mapRef = ref<MglMapInstance | null>(null)

const style = '/map/style.json'
const center: [number, number] = [13.0867, 47.7239]
const zoom = 12

const trailGeoJson = computed<GeoJSON.FeatureCollection>(() => ({
  type: 'FeatureCollection',
  features: props.trails
    .filter(t => t.geometry_geojson)
    .map(trail => ({
      type: 'Feature',
      properties: {
        id: trail.id
      },
      geometry: trail.geometry_geojson as unknown as GeoJSON.MultiLineString
    }))
}))

function updateBbox() {
  const map = mapRef.value?.map
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
  const map = mapRef.value?.map
  if (!map) return

  updateBbox()
  map.on('moveend', updateBbox)

  if (!map.getSource('trails')) {
    map.addSource('trails', {
      type: 'geojson',
      data: trailGeoJson.value
    })
  }

  if (!map.getLayer('trails-line')) {
    map.addLayer({
      id: 'trails-line',
      type: 'line',
      source: 'trails',
      layout: {
        'line-join': 'round',
        'line-cap': 'round',
        'visibility': props.mode === 'trails' ? 'visible' : 'none'
      },
      paint: {
        'line-width': 4,
        'line-color': '#16a34a',
        'line-opacity': [
          'case',
          ['==', ['get', 'id'], props.selectedTrailId],
          1,
          0.7
        ]
      }
    })

    map.on('click', 'trails-line', (e) => {
      const id = e.features?.[0]?.properties?.id
      if (id) emit('selectTrail', id)
    })

    map.on('mouseenter', 'trails-line', () => {
      map.getCanvas().style.cursor = 'pointer'
    })

    map.on('mouseleave', 'trails-line', () => {
      map.getCanvas().style.cursor = ''
    })
  }
}

watch(
  trailGeoJson,
  (geo) => {
    const map = mapRef.value?.map
    const source = map?.getSource('trails') as GeoJSONSource | undefined
    if (source) source.setData(geo)
  },
  { deep: true }
)

watch(
  () => props.mode,
  (mode) => {
    const map = mapRef.value?.map
    if (!map) return
    const visibility = mode === 'trails' ? 'visible' : 'none'
    if (map.getLayer('trails-line')) {
      map.setLayoutProperty('trails-line', 'visibility', visibility)
    }
  }
)

watch(
  () => props.selectedNode,
  (node) => {
    const map = mapRef.value?.map
    if (!map) return

    if (node) {
      map.flyTo({
        center: [node.longitude, node.latitude],
        zoom: 14,
        speed: 1.2,
        curve: 1.4,
        essential: true
      })
    } else {
      map.flyTo({
        center,
        zoom,
        speed: 1.1,
        curve: 1.4,
        essential: true
      })
    }
  }
)
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
