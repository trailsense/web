<template>
  <MglMap
    ref="mapRef"
    :center="center"
    :map-style="style"
    :zoom="zoom"
  >
    <mgl-marker
      v-for="node in nodes"
      :key="node.id"
      :coordinates="node.coordinates"
    >
      <template #marker>
        <NodePopover :node="node">
          <div
            class="pin cursor-pointer"
            @click.stop="emit('select', node)"
          />
        </NodePopover>
      </template>
    </mgl-marker>

    <MglNavigationControl />
  </MglMap>
</template>

<script setup lang="ts">
import type { TrailNode } from '~/data/mockNodes'
import type { Map as MapLibreMap } from 'maplibre-gl'

const props = defineProps<{
  nodes: TrailNode[]
  selectedNode?: TrailNode | null
}>()

interface MglMapInstance {
  map?: MapLibreMap
}

const mapRef = ref<MglMapInstance | null>(null)

const emit = defineEmits<{
  (e: 'select', node: TrailNode): void
}>()

const style = '/map/style.json'
const center: [number, number] = [11.4041, 47.2692]
const zoom = 12

watch(
  () => props.selectedNode,
  (node) => {
    const map = mapRef.value?.map as MapLibreMap | undefined
    if (!map) return

    if (node) {
      map.flyTo({
        center: node.coordinates,
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
  background: #000000;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.25);
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
</style>
