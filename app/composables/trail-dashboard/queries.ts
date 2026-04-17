import { useQuery } from '@pinia/colada'
import {
  listNodesQuery,
  listTrailsQuery,
  measurementTimeseriesQuery,
  trailMeasurementTimeseriesQuery
} from '~/lib/api/@pinia/colada.gen'
import type { NodeDto, TimeseriesBucket, TimeseriesPointDto, TrailListItemDto } from '~/lib/api/types.gen'

type ApiArrayEnvelope<T> = {
  data?: T[]
}

const DEFAULT_LIST_LIMIT = 50

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

const toApiDate = (input: string | null): string | undefined => {
  if (!input) return undefined
  const parsed = new Date(input)
  if (Number.isNaN(parsed.getTime())) return undefined
  return parsed.toISOString().slice(0, 10)
}

const addDaysUtc = (date: Date, days: number) => {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next
}

const buildBucketStartIso = (fromIso: string, toIso: string, bucket: TimeseriesBucket): string[] => {
  const from = new Date(fromIso)
  const to = new Date(toIso)

  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
    return []
  }

  const stepDays = bucket === 'week' ? 7 : 1
  const result: string[] = []

  for (let cursor = new Date(from); cursor < to; cursor = addDaysUtc(cursor, stepDays)) {
    result.push(new Date(cursor).toISOString())
  }

  return result
}

function toTrailFeature(trail: TrailListItemDto): GeoJSON.Feature | null {
  if (!trail.geometry_geojson) return null

  return {
    type: 'Feature',
    id: trail.id,
    properties: {
      id: trail.id,
      name: trail.name,
      source: trail.source
    },
    geometry: trail.geometry_geojson as unknown as GeoJSON.MultiLineString
  }
}

type GeoJSONFeatureCollection = GeoJSON.FeatureCollection<
  GeoJSON.LineString | GeoJSON.MultiLineString
>

export function useTrailDashboardQueries(params: {
  selectedNodeId: Ref<string | null>
  selectedTrailId: Ref<string | null>
  timelineBucket: Ref<TimeseriesBucket>
  timelineRangeFrom: Ref<string>
  timelineRangeTo: Ref<string>
  drilldownBucket: Ref<TimeseriesBucket>
  selectedBucketRangeFrom: Ref<string | null>
  selectedBucketRangeTo: Ref<string | null>
  activeMarkerId: Ref<string | null>
  mapCenter: Ref<{
    lon: number
    lat: number
  }>
  viewMode: Ref<'nodes' | 'trails'>
}) {
  const unselectedTimelineTotals = useState<Record<string, number>>('dashboard:timeline:unselectedTotals', () => ({}))

  const selectedMarkerDate = computed(() => toApiDate(params.activeMarkerId.value))
  const statsDate = computed(() => selectedMarkerDate.value ?? toApiDate(params.timelineRangeTo.value))
  const hasEntitySelection = computed(() => Boolean(params.selectedNodeId.value || params.selectedTrailId.value))
  const bucketStartIso = computed(() =>
    buildBucketStartIso(
      params.timelineRangeFrom.value,
      params.timelineRangeTo.value,
      params.timelineBucket.value
    )
  )

  const nodesEnabled = computed(() => true)
  const trailsEnabled = computed(() => true)

  const nodesQuery = useQuery(() => ({
    ...listNodesQuery({
      query: {
        lat: params.mapCenter.value.lat,
        lon: params.mapCenter.value.lon,
        limit: DEFAULT_LIST_LIMIT
      }
    }),
    enabled: nodesEnabled.value,
    placeholderData: previousData => previousData,
    staleTime: 60_000
  }))

  const trailsQuery = useQuery(() => ({
    ...listTrailsQuery({
      query: {
        include_geo: true,
        lat: params.mapCenter.value.lat,
        lon: params.mapCenter.value.lon,
        limit: DEFAULT_LIST_LIMIT
      }
    }),
    enabled: trailsEnabled.value,
    placeholderData: previousData => previousData,
    staleTime: 60_000
  }))

  const nodesStatsQuery = useQuery(() => ({
    ...listNodesQuery({
      query: {
        lat: params.mapCenter.value.lat,
        lon: params.mapCenter.value.lon,
        limit: DEFAULT_LIST_LIMIT,
        date: statsDate.value,
        bucket: statsDate.value ? params.timelineBucket.value : undefined
      }
    }),
    enabled: nodesEnabled.value && !hasEntitySelection.value && Boolean(statsDate.value),
    staleTime: 60_000
  }))

  const trailsStatsQuery = useQuery(() => ({
    ...listTrailsQuery({
      query: {
        include_geo: false,
        lat: params.mapCenter.value.lat,
        lon: params.mapCenter.value.lon,
        limit: DEFAULT_LIST_LIMIT,
        date: statsDate.value,
        bucket: statsDate.value ? params.timelineBucket.value : undefined
      }
    }),
    enabled: trailsEnabled.value && !hasEntitySelection.value && Boolean(statsDate.value),
    staleTime: 60_000
  }))

  const nodeActivationById = computed(() => {
    const map: Record<string, number | null> = {}
    for (const node of unwrapArray<NodeDto>(nodesStatsQuery.data.value)) {
      map[node.id] = node.activation_count ?? null
    }
    return map
  })

  const trailActivationById = computed(() => {
    const map: Record<string, number | null> = {}
    for (const trail of unwrapArray<TrailListItemDto>(trailsStatsQuery.data.value)) {
      map[trail.id] = trail.activation_count ?? null
    }
    return map
  })

  const currentUnselectedTotal = computed(() => {
    if (params.viewMode.value === 'nodes') {
      const statsList = unwrapArray<NodeDto>(nodesStatsQuery.data.value)
      if (statsList.length > 0) {
        return statsList.reduce((sum, node) => sum + (node.activation_count ?? 0), 0)
      }

      return nodes.value.reduce((sum, node) => sum + (node.activation_count ?? 0), 0)
    }

    const statsList = unwrapArray<TrailListItemDto>(trailsStatsQuery.data.value)
    if (statsList.length > 0) {
      return statsList.reduce((sum, trail) => sum + (trail.activation_count ?? 0), 0)
    }

    return trails.value.reduce((sum, trail) => sum + (trail.activation_count ?? 0), 0)
  })

  const nodes = computed<NodeDto[]>(() =>
    unwrapArray<NodeDto>(nodesQuery.data.value).map(node => ({
      ...node,
      activation_count: nodeActivationById.value[node.id] ?? node.activation_count ?? null
    }))
  )

  const selectedNode = computed(() =>
    nodes.value.find(node => node.id === params.selectedNodeId.value) ?? null
  )

  const timelineQuery = useQuery(() => {
    if (params.selectedNodeId.value) {
      return {
        ...measurementTimeseriesQuery({
          path: {
            node_id: params.selectedNodeId.value
          },
          query: {
            bucket: params.timelineBucket.value,
            from: params.timelineRangeFrom.value,
            to: params.timelineRangeTo.value
          }
        }),
        enabled: true
      }
    }

    if (params.selectedTrailId.value) {
      return {
        ...trailMeasurementTimeseriesQuery({
          path: {
            trail_id: params.selectedTrailId.value
          },
          query: {
            bucket: params.timelineBucket.value,
            from: params.timelineRangeFrom.value,
            to: params.timelineRangeTo.value
          }
        }),
        enabled: true
      }
    }

    return {
      ...measurementTimeseriesQuery({
        path: {
          node_id: '__disabled__'
        },
        query: {
          bucket: params.timelineBucket.value,
          from: params.timelineRangeFrom.value,
          to: params.timelineRangeTo.value
        }
      }),
      enabled: false
    }
  })

  const timelinePoints = computed(() => {
    if (hasEntitySelection.value) {
      return unwrapArray<TimeseriesPointDto>(timelineQuery.data.value).map(point => ({
        timestamp: point.bucket_start,
        value: point.total_count
      }))
    }

    return bucketStartIso.value.map((timestamp) => {
      const key = toApiDate(timestamp) ?? timestamp
      return {
        timestamp,
        value: unselectedTimelineTotals.value[key] ?? currentUnselectedTotal.value
      }
    })
  })

  const activityQuery = useQuery(() => {
    if (!params.selectedBucketRangeFrom.value || !params.selectedBucketRangeTo.value) {
      return {
        ...measurementTimeseriesQuery({
          path: {
            node_id: '__disabled__'
          },
          query: {
            bucket: params.drilldownBucket.value,
            from: params.timelineRangeFrom.value,
            to: params.timelineRangeTo.value
          }
        }),
        enabled: false
      }
    }

    if (params.selectedNodeId.value) {
      return {
        ...measurementTimeseriesQuery({
          path: {
            node_id: params.selectedNodeId.value
          },
          query: {
            bucket: params.drilldownBucket.value,
            from: params.selectedBucketRangeFrom.value,
            to: params.selectedBucketRangeTo.value
          }
        }),
        enabled: true
      }
    }

    if (params.selectedTrailId.value) {
      return {
        ...trailMeasurementTimeseriesQuery({
          path: {
            trail_id: params.selectedTrailId.value
          },
          query: {
            bucket: params.drilldownBucket.value,
            from: params.selectedBucketRangeFrom.value,
            to: params.selectedBucketRangeTo.value
          }
        }),
        enabled: true
      }
    }

    return {
      ...measurementTimeseriesQuery({
        path: {
          node_id: '__disabled__'
        },
        query: {
          bucket: params.drilldownBucket.value,
          from: params.timelineRangeFrom.value,
          to: params.timelineRangeTo.value
        }
      }),
      enabled: false
    }
  })

  const activityPoints = computed(() =>
    unwrapArray<TimeseriesPointDto>(activityQuery.data.value).map(point => ({
      timestamp: point.bucket_start,
      value: point.total_count
    }))
  )

  const trails = computed<TrailListItemDto[]>(() =>
    unwrapArray<TrailListItemDto>(trailsQuery.data.value).map(trail => ({
      ...trail,
      activation_count: trailActivationById.value[trail.id] ?? trail.activation_count ?? null
    }))
  )

  const trailsGeoJson = computed<GeoJSONFeatureCollection>(() => {
    const features = trails.value
      .map(toTrailFeature)
      .filter((f): f is GeoJSON.Feature => Boolean(f))

    return {
      type: 'FeatureCollection',
      features: features as GeoJSON.Feature<GeoJSON.LineString | GeoJSON.MultiLineString>[]
    }
  })

  watch(
    () => [
      params.viewMode.value,
      params.timelineBucket.value,
      params.timelineRangeFrom.value,
      params.timelineRangeTo.value,
      params.mapCenter.value.lat,
      params.mapCenter.value.lon
    ],
    () => {
      unselectedTimelineTotals.value = {}
    },
    { immediate: true }
  )

  watch(
    () => [
      params.viewMode.value,
      hasEntitySelection.value,
      selectedMarkerDate.value,
      statsDate.value,
      nodesStatsQuery.isPending.value,
      trailsStatsQuery.isPending.value,
      nodesStatsQuery.data.value,
      trailsStatsQuery.data.value
    ],
    () => {
      if (hasEntitySelection.value) return
      const markerDate = selectedMarkerDate.value ?? statsDate.value
      if (!markerDate) return

      if (params.viewMode.value === 'nodes') {
        if (nodesStatsQuery.isPending.value) return
        const total = unwrapArray<NodeDto>(nodesStatsQuery.data.value).reduce((sum, node) => sum + (node.activation_count ?? 0), 0)
        unselectedTimelineTotals.value = {
          ...unselectedTimelineTotals.value,
          [markerDate]: total
        }
        return
      }

      if (trailsStatsQuery.isPending.value) return
      const total = unwrapArray<TrailListItemDto>(trailsStatsQuery.data.value).reduce((sum, trail) => sum + (trail.activation_count ?? 0), 0)
      unselectedTimelineTotals.value = {
        ...unselectedTimelineTotals.value,
        [markerDate]: total
      }
    },
    { immediate: true }
  )

  return {
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
  }
}
