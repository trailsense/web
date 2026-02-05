<template>
  <Map :nodes="nodes" />
</template>

<script setup>
import { mockNodes } from '~/data/mockNodes'

const nodes = mockNodes
</script>
