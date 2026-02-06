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
      :coordinates="[node.longitude, node.latitude]"
    >
      <template #marker>
        <NodePopover :node="node">
          <div
            class="pin cursor-pointer"
            :class="{
              'pin--active':
                props.selectedNode?.id === node.id
                || props.hoveredNodeId === node.id
            }"
            @mouseenter="emit('hover', node.id)"
            @mouseleave="emit('leave')"
            @click.stop="emit('select', node.id)"
          />
        </NodePopover>
      </template>
    </mgl-marker>

    <MglNavigationControl />
  </MglMap>
</template>

<script setup lang="ts">
import type { Map as MapLibreMap } from 'maplibre-gl'
import type { NodeDto } from '~/lib/api/types.gen'

const props = defineProps<{
  nodes: NodeDto[]
  selectedNode?: NodeDto | null
  hoveredNodeId?: string | null
}>()

interface MglMapInstance {
  map?: MapLibreMap
}

const mapRef = ref<MglMapInstance | null>(null)

const emit = defineEmits<{
  (e: 'select' | 'hover', nodeId: string): void
  (e: 'leave'): void
}>()

const style = '/map/style.json'
const center: [number, number] = [13.0867, 47.7239]
const zoom = 12

watch(
  () => props.selectedNode,
  (node) => {
    const map = mapRef.value?.map as MapLibreMap | undefined
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
