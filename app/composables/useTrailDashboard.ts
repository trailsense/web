import { useTrailDashboardQueries } from './trail-dashboard/queries'
import { useTrailDashboardTimelineState } from './trail-dashboard/timeframe-state'
import type { NodeDto, TrailListItemDto } from '~/lib/api/types.gen'

export type { DashboardGranularity } from './trail-dashboard/types'

export const TRAIL_DASHBOARD_KEY = 'trail-dashboard'

export function useTrailDashboard() {
  const route = useRoute()
  const router = useRouter()

  const viewMode = useState<'nodes' | 'trails'>('dashboard:viewMode', () => 'nodes')

  const selectedNodeId = useState<string | null>('dashboard:selectedNodeId', () => {
    const nodeId = route.query.node
    return typeof nodeId === 'string' && nodeId.length > 0 ? nodeId : null
  })
  const selectedTrailId = useState<string | null>('dashboard:selectedTrailId', () => null)
  const selectedNodeSnapshot = useState<NodeDto | null>('dashboard:selectedNodeSnapshot', () => null)
  const selectedTrailSnapshot = useState<TrailListItemDto | null>('dashboard:selectedTrailSnapshot', () => null)

  const mapCenter = useState<{
    lon: number
    lat: number
  }>('dashboard:mapCenter', () => ({
    lon: 11.393,
    lat: 47.287
  }))

  const setMapCenter = (center: typeof mapCenter.value) => {
    if (mapCenter.value.lon === center.lon && mapCenter.value.lat === center.lat) {
      return
    }
    mapCenter.value = center
  }

  const timeline = useTrailDashboardTimelineState()
  const {
    activeMarkerId,
    drilldownBucket,
    selectedBucketRangeFrom,
    selectedBucketRangeTo,
    setTimelineBuckets,
    timelineBucket,
    timelineRangeFrom,
    timelineRangeTo
  } = timeline

  const {
    activityPoints,
    activityQuery,
    nodes,
    nodesQuery,
    timelinePoints,
    timelineQuery,
    trails,
    trailsQuery,
    trailsGeoJson
  } = useTrailDashboardQueries({
    drilldownBucket,
    selectedBucketRangeFrom,
    selectedBucketRangeTo,
    selectedNodeId,
    selectedTrailId,
    activeMarkerId,
    mapCenter,
    viewMode,
    timelineBucket,
    timelineRangeFrom,
    timelineRangeTo
  })

  const selectedTrail = computed(() => {
    if (!selectedTrailId.value) return null

    const fromCurrentList = trails.value.find(trail => trail.id === selectedTrailId.value) ?? null
    if (fromCurrentList) return fromCurrentList

    if (selectedTrailSnapshot.value?.id === selectedTrailId.value) {
      return selectedTrailSnapshot.value
    }

    return null
  })

  const selectedNode = computed(() => {
    if (!selectedNodeId.value) return null

    const fromCurrentList = nodes.value.find(node => node.id === selectedNodeId.value) ?? null
    if (fromCurrentList) return fromCurrentList

    if (selectedNodeSnapshot.value?.id === selectedNodeId.value) {
      return selectedNodeSnapshot.value
    }

    return null
  })

  const selectNode = (nodeId: string | null) => {
    selectedNodeId.value = nodeId

    if (nodeId) {
      selectedTrailId.value = null
      selectedTrailSnapshot.value = null
      const found = nodes.value.find(node => node.id === nodeId)
      if (found) {
        selectedNodeSnapshot.value = found
      }
    } else {
      selectedNodeSnapshot.value = null
    }
  }

  const selectTrail = (trailId: string | null) => {
    selectedTrailId.value = trailId

    if (trailId) {
      selectedNodeId.value = null
      selectedNodeSnapshot.value = null
      const found = trails.value.find(trail => trail.id === trailId)
      if (found) {
        selectedTrailSnapshot.value = found
      }
    } else {
      selectedTrailSnapshot.value = null
    }
  }

  watch(
    () => route.query.node,
    (nodeId) => {
      const fromQuery = typeof nodeId === 'string' && nodeId.length > 0 ? nodeId : null
      if (fromQuery !== selectedNodeId.value) {
        selectedNodeId.value = fromQuery
        if (fromQuery) {
          selectedTrailId.value = null
          selectedTrailSnapshot.value = null
          const found = nodes.value.find(node => node.id === fromQuery)
          selectedNodeSnapshot.value = found ?? (selectedNodeSnapshot.value?.id === fromQuery ? selectedNodeSnapshot.value : null)
        } else {
          selectedNodeSnapshot.value = null
        }
      }
    }
  )

  watch(selectedNodeId, async (nodeId) => {
    const currentNode = typeof route.query.node === 'string' ? route.query.node : null
    if (currentNode === nodeId) {
      return
    }

    const nextQuery = { ...route.query }
    if (nodeId) {
      nextQuery.node = nodeId
    } else {
      delete nextQuery.node
    }

    await router.replace({ query: nextQuery })
  })

  watch(nodes, (list) => {
    if (!selectedNodeId.value) return
    const found = list.find(node => node.id === selectedNodeId.value)
    if (found) {
      selectedNodeSnapshot.value = found
    }
  })

  watch(trails, (list) => {
    if (!selectedTrailId.value) return
    const found = list.find(trail => trail.id === selectedTrailId.value)
    if (found) {
      selectedTrailSnapshot.value = found
    }
  })

  watch(timelinePoints, (points) => {
    setTimelineBuckets(points.map(point => point.timestamp))
  }, { immediate: true })

  return {
    ...timeline,
    activityPoints,
    activityQuery,
    mapCenter,
    nodes,
    nodesQuery,
    selectedNode,
    selectedNodeId,
    selectNode,
    selectedTrail,
    selectedTrailId,
    selectTrail,
    timelinePoints,
    timelineQuery,
    trails,
    trailsQuery,
    trailsGeoJson,
    setMapCenter
  }
}

export type TrailDashboardState = ReturnType<typeof useTrailDashboard>
