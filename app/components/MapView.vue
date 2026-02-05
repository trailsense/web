<template>
  <MglMap
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
        <div class="pin" />
      </template>
    </mgl-marker>

    <MglNavigationControl />
  </MglMap>
</template>

<script setup>
defineProps({
  nodes: {
    type: Array,
    required: true
  }
})

const style = '/map/style.json'
const center = [11.4041, 47.2692]
const zoom = 10
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
