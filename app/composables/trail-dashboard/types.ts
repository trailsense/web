export type DashboardPeriod = 'daily' | 'weekly' | 'monthly' | 'custom'

export interface TrailNodeActivity {
  nodeId: string
  activity: number
}

export interface TrailDto {
  id: string
  name: string
  nodes: {
    id: string
    latitude: number
    longitude: number
  }[]
  nodeActivities: TrailNodeActivity[]
  averageActivity: number
}
