<template>
  <MapView
    :nodes="nodes"
    :selected-node="selectedNode"
    @select="selectedNode = $event"
  />
</template>

<script setup lang="ts">
import { mockNodes, type TrailNode } from '~/data/mockNodes'

const nodes = mockNodes

const selectedNode = useState<TrailNode | null>('selectedNode', () => null)
</script>
