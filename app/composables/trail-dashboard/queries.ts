import { useQuery } from '@pinia/colada'
import { listNodesQuery, measurementTimeseriesQuery } from '~/lib/api/@pinia/colada.gen'
import type { NodeDto, TimeseriesBucket, TimeseriesPointDto } from '~/lib/api/types.gen'

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

export function useTrailDashboardQueries(params: {
  selectedNodeId: Ref<string | null>
  bucket: Ref<TimeseriesBucket>
  rangeFrom: Ref<string>
  rangeTo: Ref<string>
}) {
  const nodesQuery = useQuery(() => ({
    ...listNodesQuery(),
    staleTime: 60_000
  }))

  const nodes = computed<NodeDto[]>(() => unwrapArray<NodeDto>(nodesQuery.data.value))
  const selectedNode = computed(() =>
    nodes.value.find(node => node.id === params.selectedNodeId.value) ?? null
  )

  const timeseriesQuery = useQuery(() => ({
    ...measurementTimeseriesQuery({
      query: {
        node_id: params.selectedNodeId.value ?? '',
        bucket: params.bucket.value,
        from: params.rangeFrom.value,
        to: params.rangeTo.value
      }
    }),
    enabled: Boolean(params.selectedNodeId.value)
  }))

  const points = computed(() =>
    unwrapArray<TimeseriesPointDto>(timeseriesQuery.data.value).map(point => ({
      timestamp: point.bucket_start,
      value: point.total_count
    }))
  )

  return {
    nodes,
    nodesQuery,
    points,
    selectedNode,
    timeseriesQuery
  }
}
