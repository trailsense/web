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
      :generate-id="true"
    >
      <mgl-line-layer
        layer-id="trails-line"
        :layout="{ 'line-join': 'round', 'line-cap': 'round' }"
        :paint="trailPaint"
        :visibility="mode === 'trails' ? 'visible' : 'none'"
      />
    </mgl-geo-json-source>

    <MglNavigationControl />
  </MglMap>
</template>

<script setup lang="ts">
import maplibregl, { type Map as MapLibreMap } from 'maplibre-gl'
import type { NodeDto, TrailListItemDto } from '~/lib/api/types.gen'
import type { TrailDashboardState } from '~/composables/useTrailDashboard'
import { TRAIL_DASHBOARD_KEY } from '~/composables/useTrailDashboard'
import { ref, computed, inject, watch } from 'vue'

const props = defineProps<{
  mode: 'nodes' | 'trails'
  nodes: NodeDto[]
  trails: TrailListItemDto[]
  selectedNode?: NodeDto | null
  hoveredNodeId?: string | null
  selectedTrailId?: string | null
  hoveredTrailIdFromList?: string | null
}>()

const emit = defineEmits<{
  (e: 'selectNode' | 'hoverNode' | 'selectTrail', id: string): void
  (e: 'leaveNode'): void
}>()

const dashboard = inject<TrailDashboardState>(TRAIL_DASHBOARD_KEY)

const mapRef = ref<{ map: MapLibreMap } | null>(null)
const hoveredTrailId = ref<string | null>(null)

const style = '/map/style.json'
const center: [number, number] = [11.393, 47.287]
const zoom = 13
const CAMERA_MARGIN = 24
const EDGE_PROXIMITY = 28
const EDGE_COVERAGE_RATIO = 0.35
const EDGE_BAND_RATIO = 0.45

type CameraPadding = {
  top: number
  right: number
  bottom: number
  left: number
}

type TrailGeoJsonProperties = {
  id: string
  name: string
  source: string
}

type TrailGeoJsonFeature = GeoJSON.Feature<GeoJSON.MultiLineString, TrailGeoJsonProperties>

const trailGeoJson = computed<GeoJSON.FeatureCollection<GeoJSON.MultiLineString, TrailGeoJsonProperties>>(() => {
  const features = props.trails
    .filter((trail): trail is TrailListItemDto & { geometry_geojson: GeoJSON.MultiLineString } =>
      Boolean(trail.geometry_geojson)
    )
    .map(trail => ({
      type: 'Feature',
      properties: {
        id: trail.id,
        name: trail.name,
        source: trail.source
      },
      geometry: trail.geometry_geojson as GeoJSON.MultiLineString
    })) as TrailGeoJsonFeature[]

  return {
    type: 'FeatureCollection',
    features
  }
})

const effectiveHoveredTrailId = computed(() => {
  const hoveredTrailIdValue = props.hoveredTrailIdFromList ?? hoveredTrailId.value

  if (!hoveredTrailIdValue) return null
  if (props.selectedTrailId && hoveredTrailIdValue !== props.selectedTrailId) return null

  return hoveredTrailIdValue
})

const trailPaint = computed<Record<string, unknown>>(() => ({
  'line-color': [
    'case',
    ['==', ['get', 'id'], props.selectedTrailId],
    '#2f5a49',
    ['==', ['get', 'id'], effectiveHoveredTrailId.value],
    '#2f5a49',
    '#4a7562'
  ],
  'line-color-transition': {
    duration: 180,
    delay: 0
  },
  'line-width': [
    'case',
    ['==', ['get', 'id'], props.selectedTrailId],
    4.5,
    ['==', ['get', 'id'], effectiveHoveredTrailId.value],
    4.5,
    2
  ],
  'line-width-transition': {
    duration: 240,
    delay: 0
  }
}))

function getMap() {
  return mapRef.value?.map
}

function getCameraPadding(): CameraPadding {
  const map = getMap()

  const padding: CameraPadding = {
    top: CAMERA_MARGIN,
    right: CAMERA_MARGIN,
    bottom: CAMERA_MARGIN,
    left: CAMERA_MARGIN
  }

  if (!map) return padding

  const mapRect = map.getContainer().getBoundingClientRect()
  const minVerticalCoverage = mapRect.height * EDGE_COVERAGE_RATIO
  const minHorizontalCoverage = mapRect.width * EDGE_COVERAGE_RATIO

  const overlays = Array.from(document.querySelectorAll<HTMLElement>('[data-map-overlay]'))

  overlays.forEach((overlay) => {
    const style = window.getComputedStyle(overlay)

    if (style.display === 'none' || style.visibility === 'hidden') return

    const rect = overlay.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    const intersectLeft = Math.max(rect.left, mapRect.left)
    const intersectTop = Math.max(rect.top, mapRect.top)
    const intersectRight = Math.min(rect.right, mapRect.right)
    const intersectBottom = Math.min(rect.bottom, mapRect.bottom)

    if (intersectRight <= intersectLeft || intersectBottom <= intersectTop) return

    const overlapWidth = intersectRight - intersectLeft
    const overlapHeight = intersectBottom - intersectTop

    const nearLeft = rect.left <= mapRect.left + EDGE_PROXIMITY
    const nearRight = rect.right >= mapRect.right - EDGE_PROXIMITY
    const nearTop = rect.top <= mapRect.top + EDGE_PROXIMITY
    const nearBottom = rect.bottom >= mapRect.bottom - EDGE_PROXIMITY

    if (nearLeft && overlapHeight >= minVerticalCoverage) {
      const coverFromLeft = intersectRight - mapRect.left
      padding.left = Math.max(padding.left, Math.ceil(coverFromLeft + CAMERA_MARGIN))
    }

    if (nearRight && overlapHeight >= minVerticalCoverage) {
      const coverFromRight = mapRect.right - intersectLeft
      padding.right = Math.max(padding.right, Math.ceil(coverFromRight + CAMERA_MARGIN))
    }

    if (nearTop && overlapWidth >= minHorizontalCoverage && overlapHeight <= mapRect.height * EDGE_BAND_RATIO) {
      const coverFromTop = intersectBottom - mapRect.top
      padding.top = Math.max(padding.top, Math.ceil(coverFromTop + CAMERA_MARGIN))
    }

    if (nearBottom && overlapWidth >= minHorizontalCoverage && overlapHeight <= mapRect.height * EDGE_BAND_RATIO) {
      const coverFromBottom = mapRect.bottom - intersectTop
      padding.bottom = Math.max(padding.bottom, Math.ceil(coverFromBottom + CAMERA_MARGIN))
    }
  })

  return padding
}

function getFitBoundsPadding(): CameraPadding {
  const map = getMap()
  const mapRect = map?.getContainer().getBoundingClientRect()

  if (!map || !mapRect) {
    return {
      top: CAMERA_MARGIN,
      right: CAMERA_MARGIN,
      bottom: CAMERA_MARGIN,
      left: CAMERA_MARGIN
    }
  }

  // For trail fitting, use balanced padding to center content in the visible area
  const overlays = Array.from(document.querySelectorAll<HTMLElement>('[data-map-overlay]'))
  let maxLeftSpace = 0
  let maxRightSpace = 0

  overlays.forEach((overlay) => {
    const style = window.getComputedStyle(overlay)
    if (style.display === 'none' || style.visibility === 'hidden') return

    const rect = overlay.getBoundingClientRect()
    if (rect.width <= 0 || rect.height <= 0) return

    if (rect.right <= mapRect.left + mapRect.width / 2) {
      maxLeftSpace = Math.max(maxLeftSpace, rect.right - mapRect.left)
    } else {
      maxRightSpace = Math.max(maxRightSpace, mapRect.right - rect.left)
    }
  })

  // Use minimal padding to avoid excessive zoom-out while slightly offsetting for overlays
  return {
    top: CAMERA_MARGIN,
    right: Math.max(CAMERA_MARGIN, maxRightSpace * 0.15),
    bottom: CAMERA_MARGIN,
    left: Math.max(CAMERA_MARGIN, maxLeftSpace * 0.15)
  }
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

  map.on('mousemove', 'trails-line', (e) => {
    const feature = e.features?.[0]
    if (!feature) return
    hoveredTrailId.value = feature.properties?.id ?? null
  })

  map.on('mouseleave', 'trails-line', () => {
    hoveredTrailId.value = null
  })

  map.on('mouseenter', 'trails-line', () => {
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', 'trails-line', () => {
    map.getCanvas().style.cursor = ''
  })

  map.on('click', 'trails-line', (e) => {
    const feature = e.features?.[0]
    const id = feature?.properties?.id
    if (!id) return
    emit('selectTrail', id)
  })
}

watch(
  () => props.selectedNode,
  (node) => {
    const map = getMap()
    if (!map) return

    if (node) {
      map.flyTo({
        center: [node.longitude, node.latitude],
        zoom: 14,
        speed: 1,
        curve: 1.4,
        padding: getCameraPadding(),
        essential: true
      })
    }
  }
)

watch(
  () => props.selectedTrailId,
  (id) => {
    const map = getMap()
    if (!map) return

    if (!id) return

    const trail = props.trails.find(t => t.id === id)
    const coords = trail?.geometry_geojson?.coordinates
    if (!coords?.length || !coords[0]?.length) return

    const firstCoord = coords[0][0] as [number, number]
    const bounds = new maplibregl.LngLatBounds(firstCoord, firstCoord)
    coords.forEach((line) => {
      line.forEach(coord => bounds.extend(coord as [number, number]))
    })

    map.fitBounds(bounds, {
      padding: getFitBoundsPadding(),
      duration: 1200,
      easing: t => 1 - Math.pow(1 - t, 3)
    })
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
