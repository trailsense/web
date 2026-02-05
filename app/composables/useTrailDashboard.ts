import { useQuery } from '@pinia/colada'
import { listNodesQuery, measurementTimeseriesQuery } from '~/lib/api/@pinia/colada.gen'
import type { NodeDto, TimeseriesBucket, TimeseriesPointDto } from '~/lib/api/types.gen'

const DAY_MS = 24 * 60 * 60 * 1000
const HOUR_MS = 60 * 60 * 1000
const MAX_HOURLY_RANGE_DAYS = 31
const MAX_DAILY_RANGE_DAYS = 365

const parseDate = (input: string, fallback: Date): Date => {
  const date = new Date(input)
  return Number.isNaN(date.getTime()) ? fallback : date
}

type ApiArrayEnvelope<T> = {
  data?: T[]
}

const unwrapArray = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[]
  }

  if (payload && typeof payload === 'object') {
    const data = (payload as ApiArrayEnvelope<T>).data
    if (Array.isArray(data)) {
      return data
    }
  }

  return []
}

const getMaxRangeMs = (bucket: TimeseriesBucket) =>
  bucket === 'hour' ? MAX_HOURLY_RANGE_DAYS * DAY_MS : MAX_DAILY_RANGE_DAYS * DAY_MS

const nowRoundedToHour = () => {
  const now = new Date()
  now.setMinutes(0, 0, 0)
  return now
}

const defaultRange = (bucket: TimeseriesBucket) => {
  const to = nowRoundedToHour()
  const from = new Date(to)
  from.setDate(from.getDate() - (bucket === 'hour' ? 7 : 30))
  return { from: from.toISOString(), to: to.toISOString() }
}

export const TRAIL_DASHBOARD_KEY = 'trail-dashboard'

export function useTrailDashboard() {
  const route = useRoute()
  const router = useRouter()

  const selectedNodeId = useState<string | null>('dashboard:selectedNodeId', () => {
    const nodeId = route.query.node
    return typeof nodeId === 'string' && nodeId.length > 0 ? nodeId : null
  })
  const bucket = useState<TimeseriesBucket>('dashboard:bucket', () => 'hour')
  const rangeFrom = useState<string>('dashboard:rangeFrom', () => defaultRange('hour').from)
  const rangeTo = useState<string>('dashboard:rangeTo', () => defaultRange('hour').to)

  const normalizeRange = () => {
    const fallbackTo = nowRoundedToHour()
    let to = parseDate(rangeTo.value, fallbackTo)
    let from = parseDate(rangeFrom.value, new Date(to.getTime() - 7 * DAY_MS))

    if (to <= from) {
      to = new Date(from.getTime() + HOUR_MS)
    }

    const maxRangeMs = getMaxRangeMs(bucket.value)
    if (to.getTime() - from.getTime() > maxRangeMs) {
      from = new Date(to.getTime() - maxRangeMs)
    }

    rangeFrom.value = from.toISOString()
    rangeTo.value = to.toISOString()
  }

  const nodesQuery = useQuery(() => ({
    ...listNodesQuery(),
    staleTime: 60_000
  }))

  const nodes = computed<NodeDto[]>(() => unwrapArray<NodeDto>(nodesQuery.data.value))
  const selectedNode = computed(() =>
    nodes.value.find(node => node.id === selectedNodeId.value) ?? null
  )

  const timeseriesQuery = useQuery(() => ({
    ...measurementTimeseriesQuery({
      query: {
        node_id: selectedNodeId.value ?? '',
        bucket: bucket.value,
        from: rangeFrom.value,
        to: rangeTo.value
      }
    }),
    enabled: Boolean(selectedNodeId.value)
  }))

  const points = computed(() =>
    unwrapArray<TimeseriesPointDto>(timeseriesQuery.data.value).map(point => ({
      timestamp: point.bucket_start,
      value: point.total_count
    }))
  )

  const maxRangeDays = computed(() =>
    bucket.value === 'hour' ? MAX_HOURLY_RANGE_DAYS : MAX_DAILY_RANGE_DAYS
  )

  const selectNode = (nodeId: string | null) => {
    selectedNodeId.value = nodeId
  }

  const setBucket = (nextBucket: TimeseriesBucket) => {
    if (bucket.value === nextBucket) {
      return
    }
    bucket.value = nextBucket
    normalizeRange()
  }

  const setRangeFrom = (iso: string) => {
    rangeFrom.value = iso
    normalizeRange()
  }

  const setRangeTo = (iso: string) => {
    rangeTo.value = iso
    normalizeRange()
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
    bucket,
    maxRangeDays,
    nodes,
    nodesQuery,
    points,
    rangeFrom,
    rangeTo,
    selectedNode,
    selectedNodeId,
    selectNode,
    setBucket,
    setRangeFrom,
    setRangeTo,
    timeseriesQuery
  }
}

export type TrailDashboardState = ReturnType<typeof useTrailDashboard>
