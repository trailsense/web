<template>
  <MglMap
    :center="center"
    :map-style="style"
    :zoom="zoom"
  >
    <MglNavigationControl />
  </MglMap>
</template>

<script setup>
const style = '/map/style.json'
const center = [-1.559482, 47.21322]
const zoom = 8
</script>
