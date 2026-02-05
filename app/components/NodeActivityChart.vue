<script lang="ts" setup>
import { ref, computed } from 'vue'
import type { NodeActivity } from '~/data/mockNodes'

const props = withDefaults(
  defineProps<{
    activity: NodeActivity
    showTitle?: boolean
  }>(),
  { showTitle: false }
)

const selectedMode = ref<'daily' | 'weekly' | 'monthly'>('daily')
const modes: Array<'daily' | 'weekly' | 'monthly'> = ['daily', 'weekly', 'monthly']

const ChartData = computed(() => {
  const data = props.activity[selectedMode.value] || []
  return data.map(d => ({ activity: d.value }))
})

const ChartLabels = computed(() => {
  const data = props.activity[selectedMode.value] || []
  return data.map((d) => {
    const date = new Date(d.timestamp)
    if (selectedMode.value === 'daily') {
      return `${date.getHours()}:00`
    } else if (selectedMode.value === 'weekly') {
      return date.toLocaleDateString([], { weekday: 'short' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  })
})

const ChartCategories = computed(() => ({
  activity: { name: 'Activity', color: '#6EE7B7' }
}))

const xFormatter = (i: number) => ChartLabels.value[i] || ''
const yFormatter = (tick: number) => tick.toString()
</script>

<template>
  <div
    class="mx-auto max-w-3xl space-y-4 rounded-lg"
    :class="props.showTitle ? 'p-6' : ''"
  >
    <div class="flex justify-between items-center">
      <h3 class="text-lg font-semibold">
        Activity
      </h3>
      <div class="flex space-x-2 text-xs text-gray-500">
        <button
          v-for="mode in modes"
          :key="mode"
          :class="{ 'font-semibold text-black': selectedMode === mode }"
          @click="selectedMode = mode"
        >
          {{ mode.charAt(0).toUpperCase() + mode.slice(1) }}
        </button>
      </div>
    </div>

    <BarChart
      :data="ChartData"
      :height="300"
      :categories="ChartCategories"
      :y-axis="['activity']"
      :x-num-ticks="12"
      :radius="4"
      :y-grid-line="true"
      :x-formatter="xFormatter"
      :y-formatter="yFormatter"
      :hide-legend="false"
    />
  </div>
</template>
