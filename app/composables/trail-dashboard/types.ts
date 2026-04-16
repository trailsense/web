export type DashboardGranularity = 'day' | 'week'

export interface TrailNodeActivity {
  nodeId: string
  activity: number
}

export interface TimelineMarker {
  id: string
  bucketStart: string
}
