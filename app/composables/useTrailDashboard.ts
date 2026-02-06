import { useTrailDashboardQueries } from './trail-dashboard/queries'
import { useTrailDashboardTimeframeState } from './trail-dashboard/timeframe-state'

export type { DashboardPeriod } from './trail-dashboard/types'

export const TRAIL_DASHBOARD_KEY = 'trail-dashboard'

export function useTrailDashboard() {
  const route = useRoute()
  const router = useRouter()

  const selectedNodeId = useState<string | null>('dashboard:selectedNodeId', () => {
    const nodeId = route.query.node
    return typeof nodeId === 'string' && nodeId.length > 0 ? nodeId : null
  })

  const timeframe = useTrailDashboardTimeframeState()
  const { bucket, rangeFrom, rangeTo } = timeframe
  const { nodes, nodesQuery, points, selectedNode, timeseriesQuery } = useTrailDashboardQueries({
    selectedNodeId,
    bucket,
    rangeFrom,
    rangeTo
  })

  const selectNode = (nodeId: string | null) => {
    selectedNodeId.value = nodeId
  }

  watch(
    () => route.query.node,
    (nodeId) => {
      const fromQuery = typeof nodeId === 'string' && nodeId.length > 0 ? nodeId : null
      if (fromQuery !== selectedNodeId.value) {
        selectedNodeId.value = fromQuery
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

  return {
    ...timeframe,
    nodes,
    nodesQuery,
    points,
    selectedNode,
    selectedNodeId,
    selectNode,
    timeseriesQuery
  }
}

export type TrailDashboardState = ReturnType<typeof useTrailDashboard>
