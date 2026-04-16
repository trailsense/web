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
  trailBbox: Ref<{
    min_lon: number
    min_lat: number
    max_lon: number
    max_lat: number
  } | null>
}) {
  const nodesQuery = useQuery(() => ({
    ...listNodesQuery(),
    staleTime: 60_000
  }))

  const nodes = computed<NodeDto[]>(() =>
    unwrapArray<NodeDto>(nodesQuery.data.value)
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

  const timelinePoints = computed(() =>
    unwrapArray<TimeseriesPointDto>(timelineQuery.data.value).map(point => ({
      timestamp: point.bucket_start,
      value: point.total_count
    }))
  )

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

  const trailsQuery = useQuery(() => {
    const bbox = params.trailBbox.value

    if (!bbox) {
      return {
        ...listTrailsQuery(),
        enabled: false
      }
    }

    return {
      ...listTrailsQuery({
        query: {
          min_lon: bbox.min_lon,
          min_lat: bbox.min_lat,
          max_lon: bbox.max_lon,
          max_lat: bbox.max_lat,
          include_geo: true,
          limit: 50
        }
      }),
      key: [
        'trails-by-bbox',
        bbox.min_lon,
        bbox.min_lat,
        bbox.max_lon,
        bbox.max_lat
      ],
      enabled: true,
      staleTime: 60_000
    }
  })

  const trails = computed<TrailListItemDto[]>(() =>
    unwrapArray<TrailListItemDto>(trailsQuery.data.value)
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
