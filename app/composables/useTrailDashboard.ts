import { useTrailDashboardQueries } from './trail-dashboard/queries'
import { useTrailDashboardTimelineState } from './trail-dashboard/timeframe-state'
import type { TrailListItemDto } from '~/lib/api/types.gen'

export type { DashboardGranularity } from './trail-dashboard/types'

export const TRAIL_DASHBOARD_KEY = 'trail-dashboard'

export function useTrailDashboard() {
  const route = useRoute()
  const router = useRouter()

  const selectedNodeId = useState<string | null>('dashboard:selectedNodeId', () => {
    const nodeId = route.query.node
    return typeof nodeId === 'string' && nodeId.length > 0 ? nodeId : null
  })
  const selectedTrailId = useState<string | null>('dashboard:selectedTrailId', () => null)
  const selectedTrailSnapshot = useState<TrailListItemDto | null>('dashboard:selectedTrailSnapshot', () => null)

  const trailBbox = useState<{
    min_lon: number
    min_lat: number
    max_lon: number
    max_lat: number
  } | null>('dashboard:trailBbox', () => null)

  const setTrailBbox = (bbox: typeof trailBbox.value) => {
    trailBbox.value = bbox
  }

  const timeline = useTrailDashboardTimelineState()
  const {
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
    selectedNode,
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
    trailBbox,
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

  const selectNode = (nodeId: string | null) => {
    selectedNodeId.value = nodeId

    if (nodeId) {
      selectedTrailId.value = null
      selectedTrailSnapshot.value = null
    }
  }

  const selectTrail = (trailId: string | null) => {
    selectedTrailId.value = trailId

    if (trailId) {
      selectedNodeId.value = null
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
    if (selectedNodeId.value && !list.some(node => node.id === selectedNodeId.value)) {
      selectedNodeId.value = null
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
    setTrailBbox
  }
}

export type TrailDashboardState = ReturnType<typeof useTrailDashboard>
