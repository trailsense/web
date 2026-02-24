import { useQuery } from '@pinia/colada'
import { listNodesQuery, listTrailsQuery, measurementTimeseriesQuery } from '~/lib/api/@pinia/colada.gen'
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
  bucket: Ref<TimeseriesBucket>
  rangeFrom: Ref<string>
  rangeTo: Ref<string>
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

  const trailsQuery = useQuery(() => {
    console.log('Trail bbox for query:', params.trailBbox.value)
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
      features
    }
  })

  return {
    nodes,
    nodesQuery,
    points,
    selectedNode,
    timeseriesQuery,
    trails,
    trailsQuery,
    trailsGeoJson
  }
}
